
var app = new Vue({
    el: '#app',
    data: {
      // UI flags
      chatOpen: false,
      newmessage: "",
      socket: null,
      scores: {},
      messages: [],
      noGames: false
    },
    created: function(){
      console.log('Vuejs is ready')
      this.connectSocket();
      this.refreshScoresAndMessages();
    },
    methods:{
      
      addMessage: function(){
        let data = {
          action: 'add',
          resource: 'messages',
          data: this.newmessage
        }
        
        this.socket.send(JSON.stringify(data));
        this.newmessage = "";
      },
      refreshScoresAndMessages: function(){
        this.socket.onopen = () => {
          // refresh scores on open page
          let request = {
              action: 'list',
              resource: 'scores'
          }
          this.socket.send(JSON.stringify(request));
          // refresh messages on open page
          let request2 = {
              action: 'list',
              resource: 'messages'
          }
          this.socket.send(JSON.stringify(request2));
        }
      },
      connectSocket: function () {
        // connect via WebSocket
        this.socket = new WebSocket('wss://simple-scores-nba.herokuapp.com/');
        
        this.socket.onmessage = event => {
          var received = event.data;
          var data = JSON.parse(received);
          
          if (data.action === 'list' && data.resource === 'scores') {
            this.scores = data.data;
            console.log('updated Scores');
            if(this.scores.data.length == 0){
              this.noGames = true;
            }
          }
          if (data.action === 'list' && data.resource === 'messages'){
            this.messages = data.data;
            this.messages.reverse();
          }

        };
      },
    }
  })