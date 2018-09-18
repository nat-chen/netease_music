{
  let view = {
    el: '#app',
    render(data) {
      let { song, status } = data;
      $(this.el).css('background-image', `url(${song.cover})`);
      $(this.el).find('img.cover').attr('src', song.cover);
      if ($(this.el).find('audio').attr('src') !== song.url) {
        $(this.el).find('audio').attr('src', song.url);
        $(this.el).find('audio')[0].addEventListener('ended', () =>
          window.eventHub.emit('songEnd')
        );
        $(this.el).find('audio')[0].addEventListener('timeupdate', (e) => {
          let currentTime = e.currentTarget.currentTime;
          if (currentTime) {
            this.showLyric(currentTime);
          }
        })
      }
      if (status === 'playing') {
        $(this.el).find('.disc-container').addClass('playing');
      } else {
        $(this.el).find('.disc-container').removeClass('playing');
      }
      $(this.el).find('.song-description > h1').text(song.name);
      let lyricsLines = $(this.el).find('.lyric > .lines');
      console.log(lyricsLines);
      song.lyrics.split('\n').map(string => {
        let p = document.createElement('p');
        let regex = /\[(.*)\](.*)/;
        let matches = string.match(regex);
        if (matches) {
          p.textContent = matches[2];
          let time = matches[1];
          let parts = time.split(':');
          let minutes = parts[0];
          let seconds = parts[1];
          let newTime = parseInt(minutes, 10) * 60 + parseFloat(seconds, 10);
          p.setAttribute('data-time', newTime);
        } else {
          p.textContent = string;
        }
        lyricsLines.append(p);
      })
    },
    showLyric(time) {
      let allP = $(this.el).find('.lyric > .lines > p');
      let p;
      for (let i = 0; i < allP.length; i++) {
        if (i === allP.length - 1) {
          break;
        } else {
          let currentTime = allP.eq(i).attr('data-time');
          let nextTime = allP.eq(i + 1).attr('data-time');
          if (currentTime <= time && nextTime > time) {
            p = allP[i];
            break;
          }
        } 
      }
      console.log(p)
      let pHeight = p.getBoundingClientRect().top;
      let lineHeight = $(this.el).find('.lyric >.lines')[0].getBoundingClientRect().top;
      let height = pHeight - lineHeight;
      $(this.el).find('.lyric >.lines').css({
        transform: `translateY(-${height - 25}px)`
      })
      $(p).addClass('active').siblings('.active').removeClass('active');
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
          this.model.data.status = 'playing';
          // setTimeout(() => this.view.play(), 0);
          this.view.render(this.model.data);
          this.view.play() //view 中只更新一次 url, 此写法才不出 bug

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
      window.eventHub.on('songEnd', () => {
        this.model.data.status = 'paused';
        this.view.render(this.model.data);
      })
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