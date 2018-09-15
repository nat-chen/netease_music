{
  let view = {
    el: '#app',
    render(data) {
      let { song, status } = data;
      $(this.el).css('background-image', `url(${song.cover})`);
      $(this.el).find('img.cover').attr('src', song.cover);
      if ($(this.el).find('audio').attr('src') !== song.url) {
        $(this.el).find('audio').attr('src', song.url);
      }
      console.log(song.url)
      if (status === 'playing') {
        $(this.el).find('.disc-container').addClass('playing');
      } else {
        $(this.el).find('.disc-container').removeClass('playing');
      }
    },
    play() {
      $(this.el).find('audio')[0].play();
    },
    pause() {
      $(this.el).find('audio')[0].pause();
    },
  };

  let model = {
    data: {
      song: {
        id: '',
        name: '',
        singer: '',
        url: '',
      },
      status: 'paused'
    },
    getData(id) {
      var query = new AV.Query('Song');
      return query.get(id).then(song => {
        Object.assign(this.data.song, {
          id: song.id,
          ...song.attributes
        });
        return song;
      })
    }
  }

  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.model.getData(this.getSongId()).then(() => {
        this.view.render(this.model.data);
      });
      this.bindEvents();

      
    },
    bindEvents() {
      $(this.view.el).on('click', '.icon-wrapper', () => {
        if (this.model.data.status === 'paused') {
          console.log(1)
          this.model.data.status = 'playing';
          
          setTimeout(() => this.view.play(), 0);
          this.view.render(this.model.data);

          // this.view.play().then(() => {
          //   setTimeout(() => this.view.play(), 0);
          //   console.log(this.model.data)
          //   this.view.render(this.model.data);
          //   console.log("playing")

          // })
          
          console.log('playing')
        } else {
          this.model.data.status = 'paused';
          this.view.pause()
          this.view.render(this.model.data);  
        }
        
        
        
      });
    },
    getSongId() {
      let search = window.location.search;
      if (search.indexOf('?') === 0) {
        search = search.substring(1);
      }
      let array = search.split('&').filter(v => v);
      let id = '';

      for (let i = 0; i < array.length; i++) {
        let kv = array[i].split('=');
        let [ key, value ] = kv;
        if (key === 'id') {
          id = value;
          console.log(id)
          break;
        }
      }
      return id;
    },
  }

  controller.init(view, model)
}