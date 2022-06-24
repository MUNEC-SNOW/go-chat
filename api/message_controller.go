package api

import (
	"chat-room/internal/service"
	"chat-room/pkg/common/request"
	"chat-room/pkg/common/response"
	"chat-room/pkg/global/log"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetMessage(c *gin.Context) {
	log.Logger.Info(c.Query("uuid"))
	var messageRequest request.MessageRequest
	err := c.BindQuery(&messageRequest)
	if err != nil {
		log.Logger.Error("bindQueryError", log.Any("bindQueryError",err))
	} 
	log.Logger.Info("messageRequest params: ", log.Any("messageRequest", messageRequest))

	messages, err:= service.MessageService.GetMessages(messageRequest)
	if err != nil {
		c.JSON(http.StatusOK, response.FailMsg(err.Error()))
		return
	}
	c.JSON(http.StatusOK, response.SuccessMsg(messages))
}