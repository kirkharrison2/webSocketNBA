
var app = new Vue({
    el: '#app',
    data: {
      // UI flags
      chatOpen: false,
      newmessage: "",
      message: 'Hello Vue!',
      scores: {},
      messages: []
    },
    methods:{
      addMessage: function(){
        this.messages.push(this.newmessage);
        this.messages.reverse();
      }
    }
  })