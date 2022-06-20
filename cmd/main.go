package main

import (
	// "chat-room/config"
	// "chat-room/pkg/global/log"
	"chat-room/pkg/common/constant"
	sf "chat-room/pkg/common/utils"
	"fmt"
)

func main() {
	// log.InitLogger(config.GetConfig().Log.Path, config.GetConfig().Log.Level)
	// log.Logger.Info("config", log.Any("config", config.GetConfig()))
	f1 := "mp3"
	f2 := "mp4"
	f3 := "png"
	fmt.Println(sf.GetContentTypeBySuffix(f1) == constant.AUDIO)
	fmt.Println(sf.GetContentTypeBySuffix(f2) == constant.VIDEO)
	fmt.Println(sf.GetContentTypeBySuffix(f3) == constant.IMAGE)

}

