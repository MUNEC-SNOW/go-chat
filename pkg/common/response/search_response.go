package response

import "chat-room/internal/DO"

type SearchResponse struct {
	User  DO.User  `json:"user"`
	Group DO.Group `json:"group"`
}
