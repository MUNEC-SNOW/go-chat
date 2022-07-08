import SwitchChat from "../../components/SwitchChat";
import UserInfo from "../../components/UserInfo";

export default function Left() {
  return (
    <div style={{ marginTop: 10 }}>
        <UserInfo></UserInfo>
        <SwitchChat />
    </div>
  )
}
