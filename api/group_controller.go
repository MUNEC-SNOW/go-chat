package api

import (
	"chat-room/internal/DO"
	"chat-room/internal/service"
	"chat-room/pkg/common/response"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetGroup(c *gin.Context) {
	uuid := c.Param("uuid")
	groups, err := service.GroupService.GetGroups(uuid)
	if err != nil {
		c.JSON(http.StatusOK, response.FailMsg(err.Error()))
		return
	}
	c.JSON(http.StatusOK, response.SuccessMsg(groups))
}

func SaveGroup(c *gin.Context) {
	uuid := c.Param("uuid")
	var group DO.Group
	c.ShouldBindJSON(&group)

	service.GroupService.SaveGroup(uuid, group)
	c.JSON(http.StatusOK, response.SuccessMsg(nil))
}

func GetGroupUsers(c *gin.Context) {
	uuid := c.Param("uuid")
	users := service.GroupService.GetUserIdByGroupUuid(uuid)
	c.JSON(http.StatusOK, response.SuccessMsg(users))
}