package service

import (
	"chat-room/internal/DO"
	"chat-room/internal/dao/pool"
	"chat-room/pkg/common/response"
	"chat-room/pkg/errors"
	"github.com/google/uuid"
	
)

type groupService struct{}

var GroupService = new(groupService)

func (g *groupService) GetGroups(uuid string) ([]response.GroupResponse, error) {
	db := pool.GetDB()

	group := &DO.Group{}
	db.AutoMigrate(&group)
	groupMember := &DO.GroupMember{}
	db.AutoMigrate(&groupMember)

	var queryUser *DO.User
	db.First(&queryUser, "uuid = ?", uuid)

	if queryUser.Id <= NULL_ID {
		return nil, errors.New("user not exist")
	}

	var groups []response.GroupResponse
	db.Raw("SELECT g.id AS gid, g.uuid, g.created_at, g.notice FROM group_members AS gm LEFT JOIN `groups` AS g ON gm.gid = g.id WHERE gm.user_id = ?", 
		queryUser.Id).Scan(&groups)

	return groups, nil
}

func (g *groupService) SaveGroup(groupUuid string, group DO.Group) {
	db := pool.GetDB()
	var fromUser *DO.User
	db.Find(&fromUser, "uuid = ?", groupUuid)
	if fromUser.Id <= NULL_ID {
		return
	}

	group.UserId = fromUser.Id
	group.Uuid = uuid.New().String()
	db.Save(&group)

	groupMember := DO.GroupMember{
		UserId: fromUser.Id,
		GroupId: group.ID,
		Nickname: fromUser.Username,
		Mute: 0,
	}
	db.Save(&groupMember)

}

func (g *groupService) GetUserIdByGroupUuid(groupUuid string) []DO.User {
	var group DO.Group
	db := pool.GetDB()
	db.First(&group, "uuid = ?", groupUuid)
	if group.ID <= 0 {
		return nil
	}

	var users []DO.User
	db.Raw("SELECT u.uuid, u.avatar, u.username FROM `groups` AS g JOIN group_members AS gm ON gm.group_id = g.id JOIN users AS u ON u.id = gm.user_id WHERE g.id = ?",
		group.ID).Scan(&users)
	return users
}

func (g *groupService) JoinGroup(groupUuid, userUuid string) error {
	var user DO.User
	db := pool.GetDB()
	db.First(&user, "uuid = ?", userUuid)
	if user.Id <= 0 {
		return errors.New("user not exist")
	}

	var group DO.Group
	db.First(&group, "uuid = ?", groupUuid)
	if user.Id <= 0 {
		return errors.New("group not exist")
	}
	var groupMember DO.GroupMember
	db.First(&groupMember, "user_id = ? and group_id = ?", user.Id, group.ID)
	if groupMember.ID > 0 {
		return errors.New("already member")
	}
	nickname := user.Nickname
	if nickname == "" {
		nickname = user.Username
	}
	groupMemberInsert := DO.GroupMember{
		UserId:   user.Id,
		GroupId:  group.ID,
		Nickname: nickname,
		Mute:     0,
	}
	db.Save(&groupMemberInsert)

	return nil
}