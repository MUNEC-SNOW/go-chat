package api

import (
	"chat-room/config"
	"chat-room/internal/service"
	"chat-room/pkg/common/response"
	"chat-room/pkg/global/log"
	"io/ioutil"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetFile(c *gin.Context) {
	fileName := c.Param("fileName")
	log.Logger.Info(fileName)
	data, _ := ioutil.ReadFile(config.GetConfig().StaticPath.FilePath + fileName)
	c.Writer.Write(data)
}

func SaveFile(c *gin.Context) {
	namePrefix := uuid.New().String()

	userUuid := c.PostForm("uuid")

	file, _ := c.FormFile("file")
	fileName := file.Filename
	index := strings.LastIndex(fileName, ".")
	suffix := fileName[index:]

	newFileName := namePrefix + suffix

	log.Logger.Info("file", log.Any("file name", config.GetConfig().StaticPath.FilePath+newFileName))
	log.Logger.Info("userUuid", log.Any("userUuid name", userUuid))

	c.SaveUploadedFile(file, config.GetConfig().StaticPath.FilePath + newFileName)
	err := service.UserService.ModifyUserAvatar(newFileName, userUuid)
	if err != nil {
		c.JSON(http.StatusOK, response.FailMsg(err.Error()))
	}
	c.JSON(http.StatusOK, response.SuccessMsg(newFileName))
}