package server

import (
	"chat-room/config"
	"chat-room/internal/service"
	"chat-room/pkg/common/constant"
	"chat-room/pkg/common/utils"
	"chat-room/pkg/global/log"
	"chat-room/pkg/protocol"
	"encoding/base64"
	"io/ioutil"
	"strings"
	"sync"

	"github.com/gogo/protobuf/proto"
	"github.com/google/uuid"
)

var MyServer = NewServer()

type Server struct {
	Clients   map[string]*Client
	mutex     *sync.Mutex
	Broadcast chan []byte
	Register  chan *Client
	Ungister  chan *Client
}

func NewServer() *Server {
	return &Server{
		mutex:     &sync.Mutex{},
		Clients:   make(map[string]*Client),
		Broadcast: make(chan []byte),
		Register:  make(chan *Client),
		Ungister:  make(chan *Client),
	}
}

func ComsumerKafkaMsg(data []byte) {
	MyServer.Broadcast <- data
}

func (s *Server) Start() {
	log.Logger.Info("start server", log.Any("start server", "start server..."))
	for {
		select {
		case conn := <- s.Register:
			log.Logger.Info("login", log.Any("login", "new user login in"+conn.Name))
			s.Clients[conn.Name] = conn
			msg := &protocol.Message{
				From: "System",
				To: conn.Name,
				Content: "welcome",
			}
			protoMsg, _ := proto.Marshal(msg)
			conn.Send <- protoMsg

		case conn := <-s.Ungister:
			log.Logger.Info("loginout", log.Any("loginout", conn.Name))
			if _, ok := s.Clients[conn.Name]; ok {
				close(conn.Send)
				delete(s.Clients, conn.Name)
			}
		
		case message := <-s.Broadcast:
			msg := &protocol.Message{}
			proto.Unmarshal(message, msg)

			if msg.To != "" {
				if msg.ContentType >= constant.TEXT && msg.ContentType <= constant.VIDEO {
					_, exits := s.Clients[msg.From]
					if exits {
						// saveMessage(msg)
					}

					if msg.MessageType == constant.MESSAGE_TYPE_USER {
						client, ok := s.Clients[msg.To]
						if ok {
							msgByte, err := proto.Marshal(msg)
							if err != nil {
								client.Send <- msgByte
							}
						}
					} else if msg.MessageType == constant.MESSAGE_TYPE_GROUP {
						// sendGroupMessage(msg, s)
					}
				} else {
					client, ok := s.Clients[msg.To]
					if ok {
						client.Send <- message
					}
				}
			} else {
				for id, conn := range s.Clients {
					log.Logger.Info("allUser", log.Any("allUser", id))

					select {
					case conn.Send <- message:
					default:
						close(conn.Send)
						delete(s.Clients, conn.Name)
					}
				}
			}
		}
	}
}

func sendGroupMessage(msg *protocol.Message, s *Server) {
	users := service.GroupService.GetUserIdByGroupUuid(msg.To)
	for _, user := range users {
		if user.Uuid == msg.From {
			continue
		}

		client, ok := s.Clients[user.Uuid]
		if !ok {
			continue
		}

		fromUserDetails := service.UserService.GetUserDetails(msg.From)
		msgSend := protocol.Message{
			Avatar:       fromUserDetails.Avatar,
			FromUsername: msg.FromUsername,
			From:         msg.To,
			To:           msg.From,
			Content:      msg.Content,
			ContentType:  msg.ContentType,
			Type:         msg.Type,
			MessageType:  msg.MessageType,
			Url:          msg.Url,
		}

		msgByte, err := proto.Marshal(&msgSend)
		if err != nil {
			client.Send <- msgByte
		}
	}
}

func saveMessage(message *protocol.Message) {
	if message.ContentType == 2 {
		url := uuid.New().String() + ".png"
		index := strings.Index(message.Content, "base64")
		index += 7

		content := message.Content
		content = content[index:]

		dataBuffer, dataErr := base64.StdEncoding.DecodeString(content)
		if dataErr != nil {
			log.Logger.Error("transfer base64 to file error", log.String("transfer base64 to file error", dataErr.Error()))
			return
		}
		err := ioutil.WriteFile(config.GetConfig().StaticPath.FilePath+url, dataBuffer, 0666)
		if err != nil {
			log.Logger.Error("write file error", log.String("write file error", err.Error()))
			return
		}
		message.Url = url
		message.Content = ""
	} else if message.ContentType == 3 {
		// 普通的文件二进制上传
		fileSuffix := utils.GetFileType(message.File)
		nullStr := ""
		if nullStr == fileSuffix {
			fileSuffix = strings.ToLower(message.FileSuffix)
		}
		contentType := utils.GetContentTypeBySuffix(fileSuffix)
		url := uuid.New().String() + "." + fileSuffix
		err := ioutil.WriteFile(config.GetConfig().StaticPath.FilePath+url, message.File, 0666)
		if err != nil {
			log.Logger.Error("write file error", log.String("write file error", err.Error()))
			return
		}
		message.Url = url
		message.File = nil
		message.ContentType = contentType
	}

	service.MessageService.SaveMessage(*message)
}