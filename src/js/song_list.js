{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
      </ul>
    `,
    render(data) {
      let { songs, selectedSongId } = data;
      let liList = songs.map(song => {
        let $li = $('<li></li>').text(song.name).attr('data-song-id', song.id)
        if (song.id === selectedSongId) {
          $li.addClass('active');
        }
        return $li;
      })
      let $el =  $(this.el);
      $el.html(this.template);
      $el.find('ul').empty();  
      liList.map(domLi => {
        $el.find('ul').append(domLi);
      });
    },
    clearActive() {
      $(this.el).find('.active').removeClass('active');
    }
  };
  
  let model = {
    data: {
      songs: [],
      selectedSongId: '',
    },
    find() {
      var query = new AV.Query('Song');
      return query.find().then((songs) => {
        this.data.songs = songs.map(function(song) {
          return { id: song.id, ...song.attributes};
        })
        
      })
    },
  };

  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.getAllSongs();
      this.bindEventHub();
      this.bindEvents();
    },
    getAllSongs() {
      return this.model.find().then((data) => {
        this.view.render(this.model.data);
      })
    },
    bindEvents() {
      $(this.view.el).on('click', 'li', (e) => {
        let data = null;
        let songs = this.model.data.songs;
        let songId = e.currentTarget.getAttribute('data-song-id');
        
        this.model.data.selectedSongId = songId;
        this.view.render(this.model.data);
        
        for (let i = 0; i < songs.length; i++) {
          if (songs[i].id === songId) {
            data = songs[i];
            break;
          }
        }
        window.eventHub.emit('select', JSON.parse(JSON.stringify(data)));
      })
    },
    bindEventHub() {
      window.eventHub.on('new', () => {
        this.view.clearActive();
      });
      window.eventHub.on('create', songData => {
        this.model.data.songs.push(songData);
        this.view.render(this.model.data);
      });
      window.eventHub.on('update', song => {
        let songs = this.model.data.songs;
        for (let i = 0; i < songs.length; i++) {
          if (songs[i].id === song.id) {
            Object.assign(songs[i], song);
          }
        }
        this.view.render(this.model.data);
      })
    }
  }

  controller.init(view, model);
}