import React,{Component} from 'react';
import classNames from 'classnames';
import avatar from '../images/avatar.png';
import {OrderedMap} from 'immutable';
import _ from 'lodash';
import ObjectID from '../helpers/objectid';
import SearchUser from './search-user';
import moment from 'moment';

export default class Messenger extends Component{
    constructor(props){
        super(props);
        this.state={
            height:window.innerHeight,
            newMessage: 'Hello there...',
            searchUser: "",
            showSearchUser:false,
        }
        this._onResize = this._onResize.bind(this); 
        //this.addTestMessages = this.addTestMessages.bind(this);
        this.handleSend = this.handleSend.bind(this);
        this.renderMessage = this.renderMessage.bind(this);
        this.scrollMessageToBottom = this.scrollMessageToBottom.bind(this);
        this.onCreateChannel = this.onCreateChannel.bind(this);
        this.renderChannelTitle = this.renderChannelTitle.bind(this);
    }
    renderChannelTitle(channel={}){
        const {store} = this.props;
        const members = store.getMembersFromChannel(channel);
        const names=[];
       members.forEach((user)=>{
           const name = _.get(user,'name');
           names.push(name);
       })
       return <h2>{_.join(names,',')}</h2>
    }
    onCreateChannel(){
        const {store} = this.props;
        const channelId = new ObjectID().toString();
        const channel={
            _id: channelId,
            title: "",
            lastMessage: "",
            members:new OrderedMap(),
            messages:new OrderedMap(),
            isNew: true,
            created: new Date(),
        };
        store.onCreateNewChannel(channel);
    }
    scrollMessageToBottom(){
        if(this.messagesRef){
            this.messagesRef.scrollTop = this.messagesRef.scrollHeight;
        }
    }
    renderMessage(message){
        const text = _.get(message,'body','');
        const html = _.split(text, '\n').map((m,key)=>{
            return <p key={key} dangerouslySetInnerHTML={{__html: m}}/>
        })
        return html;
    }
    handleSend(){
        const {newMessage} = this.state;
        const {store} = this.props;
        if(_.trim(newMessage).length){
            const messageId = new ObjectID().toString();
            const channel = store.getActiveChannel();
            const channelId = _.get(channel, '_id', null);
            const currentUser = store.getCurrentUser();
            const message = {
                _id:messageId,
                channelId: channelId,
                body:newMessage,
                auth:_.get(currentUser,'name',null),
                avatar: avatar,
                me:true,
            }
            store.addMessage(messageId,message);
            this.setState({
                newMessage: '',
            })
        }
        
    }
    _onResize(){
        this.setState({
            height:window.innerHeight
        });
    }
    componentDidUpdate(){
        this.scrollMessageToBottom();
    }
    componentDidMount(){
        window.addEventListener('resize',this._onResize);
    }
   /* addTestMessages(){
        const {store} = this.props;

        //create test msgs
        for(let i=0;i<100;i++)
        {
            let isMe = false;
            if(i%3===0){
                isMe = true
            }
            const newMsg={
                _id: `${i}`,
                author: `Author ${i}`,
                body: `The body of message ${i}`,
                avatar: avatar,
                me: isMe,
            }
            store.addMessage(i,newMsg);
        }

         //create test channels
         for(let c=0; c<10;c++)
         {
             let newChannel = {
                 _id: `${c}`,
                 title: `Channel title ${c}`,
                 lastMessage: `Hey there here...${c}`,
                 members:new OrderedMap({
                    '2': true,
                    '3': true,
                 }),
                 messages:new OrderedMap(),
                 created: new Date(),
             }
             const msgId = `${c}`;
             const moreMsgId = `${c+1}`;
             newChannel.messages = newChannel.messages.set(msgId,true);
             newChannel.messages = newChannel.messages.set(moreMsgId,true);
             store.addChannel(c,newChannel);
         }
    }*/
    componentWillUnmount(){
        window.removeEventListener('resize',this._onResize)
    }
    render(){
        const {store} = this.props;
        const {height} = this.state;
        const style={
            height:height,
        }
        const activeChannel = store.getActiveChannel();
        const messages = store.getMessagesFromChannel(activeChannel);
        const channels = store.getChannels();
        const members = store.getMembersFromChannel(activeChannel);

        return (
        <div style={style} className="app-messenger">
        <div className="header">
            <div className="left">
                <button className="left-action" ><i className="icon-settings-streamline-1" /></button>
                <button onClick={this.onCreateChannel} className="right-action" ><i className="icon-edit-modify-streamline" /></button>
                <h2>Messenger</h2>
            </div>
            <div className="content">

                {_.get(activeChannel,'isNew')?<div className="toolbar">
                    <label>To:</label>
                    <input placeholder="Type name of person..." onChange={(event)=>{
                        const searchUserText = _.get(event,'target.value');
                        this.setState({
                            searchUser: searchUserText,
                            showSearchUser: true,
                        });
                    }}
                    type="text" value={this.state.searchUser} />
                    {this.state.showSearchUser?<SearchUser 
                    onSelect={(user)=>{
                        this.setState({
                            showSearchUser: false,
                            searchUser:'',
                        },()=>{
                            const userId = _.get(user,'_id');
                            const channelId = _.get(activeChannel,'_id');
                            store.addUserToChannel(channelId,userId);
                        })
                    }} search={this.state.searchUser} store={store}/>:null}
                </div>:<h2>{_.get(activeChannel,'title','')}</h2>}
            </div>
            <div className="right">
                <div className="user-bar">
                    <div className="profile-name">Rahul Kushwaha</div>
                    <div className="profile-image"><img src={avatar} alt="" /></div>
                </div>
            </div>
        </div>
        <div className="main">
        <div className="sidebar-left">
            <div className="channels">
                {channels.map((channel,key)=>{
                    return (
                        <div onClick={(key)=>{
                            store.setActiveChannelId(channel._id);
                        }} key={channel._id} className={classNames('channel',{'active':_.get(activeChannel,'_id')===_.get(channel,'_id',null)})}>
                            <div className="user-image">
                                <img src={avatar} alt="" />
                            </div>
                            <div className="channel-info">
                                <h2>{this.renderChannelTitle(channel)}</h2>
                                <p>{channel.lastMessage}</p>
                            </div>
                        </div>
                    )
                })}

            </div>
        </div>
        <div className="content">
            <div ref={(ref)=>this.messagesRef=ref} className="messages">
                {messages.map((message,index)=>{
                    return (
                        <div key={index} className={classNames('message',{'me':message.me})}>
                            <div className="message-user-image">
                                <img src={message.avatar} alt="" />
                            </div>
                            <div className="message-body">
                                <div className="message-author">{message.me? 'You ' :message.author} says:</div>
                                <div className="message-text">
                                    {
                                        this.renderMessage(message)
                                    }
                                </div>
                            </div>
                        </div>
                    )
                })}

            </div>
            <div className="messenger-input">
                <div className="text-input">
                    <textarea onKeyUp={(event)=>{
                        if(event.key === 'Enter' && !event.shiftKey)
                        {
                            this.handleSend();
                        }
                    }} onChange={(event)=>{
                        this.setState({newMessage: _.get(event, 'target.value')});
                    }} value={this.state.newMessage} placeholder="Write your message..." />
                </div>
                <div className="actions">
                <button onClick={this.handleSend} className="send">Send</button>
                </div>
            </div>
        </div>
        <div className="sidebar-right">
                {members.size >0 ? <div><h2 className="title">Members</h2>
                <div className="members">
                    {members.map((member,key)=>{
                        return(
                            <div key={key} className="member">
                                <div className="user-image">
                                    <img src={_.get(member,'avatar')} alt="" />
                                </div>
                                <div className="member-info">
                                    <h2>{member.name}</h2>
                                    <p>Joined: {moment(member.created).fromNow()}</p>
                                </div>
                            </div>
                        )
                    })};

                </div></div>:null}
        </div>
        </div>
        </div>
        )
    }
}