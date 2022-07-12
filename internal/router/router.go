package router

import (
	"chat-room/api"
	"chat-room/pkg/common/response"
	"chat-room/pkg/global/log"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

func NewRouter() *gin.Engine {
	gin.SetMode(gin.ReleaseMode)

	server := gin.Default()
	server.Use(Cors())
	server.Use(Recovery)

	socket := RunSocket

	group := server.Group("")
	{
		group.GET("/user", api.GetUserList)
		group.GET("/user/:uuid", api.GetUserDetails)
		group.GET("/user/name", api.GetUserOrGroupByName)
		group.POST("/user/register", api.Register)
		group.POST("/user/login", api.Login)
		group.PUT("/user", api.ModifyUserInfo)

		group.POST("/friend", api.AddFriend)

		group.GET("/message", api.GetMessage)

		group.GET("/file/:fileName", api.GetFile)
		group.POST("/file", api.SaveFile)

		group.GET("/group/:uuid", api.GetGroup)
		group.POST("/group/:uuid", api.SaveGroup)
		group.POST("/group/join/:userUuid/:groupUuid", api.JoinGroup)
		group.GET("/group/user/:uuid", api.GetGroupUsers)

		group.GET("/socket.io", socket)
	}
	return server
}

func Cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		method := c.Request.Method
		origin := c.Request.Header.Get("Origin")
		if origin != "" {
			c.Header("Access-Control-Allow-Origin", "*") // 可将将 * 替换为指定的域名
			c.Header("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE, UPDATE")
			c.Header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization")
			c.Header("Access-Control-Expose-Headers", "Content-Length, Access-Control-Allow-Origin, Access-Control-Allow-Headers, Cache-Control, Content-Language, Content-Type")
			c.Header("Access-Control-Allow-Credentials", "true")
		}

		if method == "OPTIONS" {
			c.JSON(http.StatusOK, "ok!")
		}

		defer func() {
			if err := recover(); err != nil {
				log.Logger.Error("HttpError", zap.Any("HttpError", err))
			}
		}()

		c.Next()
	}
}

func Recovery(c *gin.Context) {
	defer func() {
		if r := recover(); r != nil {
			log.Logger.Error("gin catch error: ", log.Any("gin catch error: ", r))
			c.JSON(http.StatusOK, response.FailMsg("System error"))
		}
	}()
	c.Next()
}