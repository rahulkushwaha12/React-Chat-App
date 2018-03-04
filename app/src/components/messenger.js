import React,{Component} from 'react';
import avatar from '../images/avatar.png';
export default class Messenger extends Component{
    constructor(props){
        super(props);
        this.state={
            height:window.innerHeight,
        }
        this._onResize = this._onResize.bind(this); 
    }

    _onResize(){
        this.setState({
            height:window.innerHeight
        });
    }
    componentDidMount(){
        window.addEventListener('resize',this._onResize)
    }
    componentWillUnmount(){
        window.removeEventListener('resize',this._onResize)
    }
    render(){
        const {height} = this.state;
        const style={
            height:height,
        }
        return (
        <div style={style} className="app-messenger">
        <div className="header">
            <div className="left">
                <div className="actions">
                    <button>new message</button>
                </div>
            </div>
            <div className="content"><h2>title</h2></div>
            <div className="right">
                <div className="user-bar">
                    <div className="profile-name">Rahul Kushwaha</div>
                    <div className="profile-image"><img src={avatar} alt="" /></div>
                </div>
            </div>
        </div>
        <div className="main">
        <div className="sidebar-left">Left sidebar</div>
        <div className="content">
            <div className="messages">
                <div className="message">
                    <div className="message-user-image">
                        <img src={avatar} alt="" />
                    </div>
                    <div className="message-body">
                        <div className="message-author">Tom says:</div>
                        <div className="message-text">
                            <p>
                                Hello there...
                            </p>
                        </div>
                    </div>
                </div>

                <div className="message me">
                    <div className="message-user-image">
                        <img src={avatar} alt="" />
                    </div>
                    <div className="message-body">
                        <div className="message-author">Tom says:</div>
                        <div className="message-text">
                            <p>
                                Hello there..dnmn   .
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="sidebar-right">Right sidebar</div>
        </div>
        </div>
        )
    }
}