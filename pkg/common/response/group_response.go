package response

import "time"

type GroupResponse struct {
	Uuid 		string `json:"uuid"`
	GroupId 	string `json:"group_id"`
	CreatedAt 	time.Time `json:"createdAt"`
	Name 		string `json:"name"`
	Notice 		string `json:"notice"`
}