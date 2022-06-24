package service

import (
	"chat-room/internal/DO"
	"chat-room/internal/dao/pool"
	"chat-room/pkg/errors"
	"chat-room/pkg/global/log"
	"chat-room/pkg/common/response"
	"time"

	"github.com/google/uuid"
)

const NULL_ID int32 = 0

type userService struct {}

var UserService = new(userService)

func (u *userService) Register(user *DO.User) error {
	db := pool.GetDB()
	var userCount int64
	db.Model(user).Where("username", user.Username).Count(&userCount)
	if userCount > 0 {
		log.Logger.Error("Register-- queryUser", log.Any("queryUser", user))
		return errors.New("user already exists")
	}
	user.Uuid = uuid.New().String()
	user.CreateAt = time.Now()
	user.DeleteAt = 0

	db.Create(&user)
	return nil
}

func (u *userService) Login(user *DO.User) bool {
	pool.GetDB().AutoMigrate(&user)
	log.Logger.Debug("Login-- user", log.Any("user in service", user))
	db := pool.GetDB()

	var queryUser *DO.User
	db.First(&queryUser, "username = ?", user.Username)

	user.Uuid = queryUser.Uuid
    return user.Password == queryUser.Password
}

func (u *userService) ModifyUser(user *DO.User) error {
	var queryUser *DO.User
	db := pool.GetDB()
	db.First(&queryUser, "username = ?", user.Username)
	log.Logger.Debug("ModifyUser-- queryUser", log.Any("queryUser", queryUser))
	if NULL_ID == queryUser.Id {
		log.Logger.Error("ModifyUser-- queryUser", log.Any("queryUser", queryUser))
		return errors.New("User not exists")
	}
	queryUser.Nickname = user.Nickname
	queryUser.Email = user.Email
	queryUser.Password = user.Password

	db.Save(queryUser)
	return nil
}

func (u *userService) GetUserDetails(uuid string) DO.User {
	var queryUser *DO.User
	db := pool.GetDB()
	db.Select("uuid", "username", "nickname", "avatar").First(&queryUser, "uuid = ?", uuid)
	return *queryUser
}

// TODO: like search and word split
func (u *userService) GetUserOrGroupByName(name string) response.SearchResponse {
	var queryUser *DO.User
	db := pool.GetDB()
	db.Select("uuid", "username", "nickname", "avatar").First(&queryUser, "name = ?", name)

	var queryGroup *DO.Group
	db.Select("uuid", "name").First(queryGroup, "name = ?", name)

	search := response.SearchResponse{
		User: *queryUser,
		Group: *queryGroup,
	}
	return search
}

func (u *userService) ModifyUserAvatar(avatar string, uuid string) error {
	var queryUser *DO.User
	db := pool.GetDB()
	db.First(&queryUser, "uuid = ?", uuid)

	if NULL_ID == queryUser.Id {
		log.Logger.Error("ModifyUserAvatar-- queryUser not exist", log.Any("uuid", uuid))
		return errors.New("user not exist!")
	}

	db.Model(&queryUser).Update("avatar", avatar)
	return nil
}