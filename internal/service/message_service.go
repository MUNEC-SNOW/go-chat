package service

import (
	"chat-room/internal/DO"
	"chat-room/internal/dao/pool"
	"chat-room/pkg/common/constant"
	"chat-room/pkg/common/request"
	"chat-room/pkg/common/response"
	"chat-room/pkg/errors"
	"chat-room/pkg/global/log"
	"chat-room/pkg/protocol"

	"gorm.io/gorm"
)

type messageService struct{}

var MessageService = new(messageService)

func (m *messageService) GetMessages(msg request.MessageRequest) ([]response.MessageResponse, error) {
	db := pool.GetDB()
	message := &DO.Message{}
	pool.GetDB().AutoMigrate(&message)

	if msg.MessageType == constant.MESSAGE_TYPE_USER {
		var queryUser *DO.User
		db.First(&queryUser, "uuid =?", msg.Uuid)

		if NULL_ID == queryUser.Id {
			return nil, errors.New("user not exist")
		}

		var friend *DO.User
		db.First(&friend, "username =?", msg.FriendUsername)
		if NULL_ID == queryUser.Id {
			return nil, errors.New("friend not exist")
		}

		var messages []response.MessageResponse
		db.Raw(`SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.content_type, m.url, m.created_at, u.username AS from_username, u.avatar, to_user.username AS to_username  
		FROM messages AS m 
		LEFT JOIN users AS u ON m.from_user_id = u.id 
		LEFT JOIN users AS to_user ON m.to_user_id = to_user.id 
		WHERE from_user_id IN (?, ?) AND to_user_id IN (?, ?)`,
		queryUser.Id, friend.Id, queryUser.Id, friend.Id).Scan(&messages)
		return messages, nil
	}

	if message.MessageType == constant.MESSAGE_TYPE_GROUP {
		messages, err := fetchGroupMessage(db, msg.Uuid)
		if err != nil {
			return nil, err
		}
		return messages, nil
	}

	return nil, errors.New("not is supportted message search type")
}

func fetchGroupMessage(db *gorm.DB, toUuid string) ([]response.MessageResponse, error) {
	var group DO.Group
	db.First(&group, "uuid = ?", toUuid)
	if group.ID <= NULL_ID {
		return nil, errors.New("group not exist")
	}

	var messages []response.MessageResponse
	db.Raw(`SELECT m.id, m.from_user_id, m.to_user_id, m.content, m.content_type, m.url, m.created_at, u.username AS from_username, u.avatar 
	FROM messages AS m 
	LEFT JOIN users AS u ON m.from_user_id = u.id 
	WHERE m.message_type = 2 AND m.to_user_id = ?`,
	group.ID).Scan(&messages)

	return messages, nil
}

func (m *messageService) SaveMessage(message *protocol.Message) {
	db := pool.GetDB()
	var fromUser DO.User
	db.Find(&fromUser, "uuid = ?", message.From)
	if NULL_ID == fromUser.Id {
		log.Logger.Error("SaveMessage not find from user", log.Any("SaveMessage not find from user", fromUser.Id))
		return
	}

	var toUserId int32 = 0

	if message.MessageType == constant.MESSAGE_TYPE_USER {
		var toUser DO.User
		db.Find(&toUser, "uuid = ?", message.To)
		if NULL_ID == toUser.Id {
			return
		}
		toUserId = toUser.Id
	}

	if message.MessageType == constant.MESSAGE_TYPE_GROUP {
		var group DO.Group
		db.Find(&group, "uuid = ?", message.To)
		if NULL_ID == group.ID {
			return
		}
		toUserId = group.ID
	}

	saveMessage := DO.Message{
		FromUserId: fromUser.Id,
		ToUserId: toUserId,
		Content: message.Content,
		ContentType: int16(message.ContentType),
		MessageType: int16(message.MessageType),
		Url: message.Url,
	}

	db.Save(&saveMessage)
}