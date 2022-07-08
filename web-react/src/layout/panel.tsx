import { Col, Row } from "antd";
import Center from "./center/Center";
import Left from "./left/left";

export default function panel() {
  return (
    <div>
        <Row style={{ paddingTop: 35, borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                    <Col span={2} style={{ borderRight: '1px solid #f0f0f0', textAlign: 'center', borderTop: '1px solid #f0f0f0' }}>
                        <Left />
                    </Col>

                    <Col span={4} style={{ borderRight: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0' }}>
                        <Center />
                    </Col>

                    <Col offset={1} span={16} style={{ borderTop: '1px solid #f0f0f0' }}>
                        {/* <Right
                            history={this.props.history}
                            sendMessage={this.sendMessage}
                            checkMediaPermisssion={this.checkMediaPermisssion}
                        /> */}
                    </Col>
                </Row>
    </div>
  )
}
