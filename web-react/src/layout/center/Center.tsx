import UserList from '../../components/UserList'
import UserSearch from '../../components/UserSearch'

export default function Center() {
    return ( 
        <div style={{ marginTop: 10 }}>
            <UserSearch />
            <UserList />
        </div>
    )
}
