{
  let view = {
    el: '#songList-container',
    template: `
      <ul class="songList">
      </ul>
    `,
    render(data) {
      let { songs } = data;
      let liList = songs.map(song => $('<li></li>').text(song.name).attr('data-song-id', song.id))
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
    },
    find() {
      var query = new AV.Query('Song');
      return query.find().then((songs) => {
        this.data.songs = songs.map(function(song) {
          return { id, ...song.attributes};
        })
        console.log('/////', song.id)
      })
    },
  };

  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.getAllSongs();
      console.log('...........',this.model.data)
      this.bindEventHub();
      this.bindEvents();
    },
    getAllSongs() {
      return this.model.find().then(() => {
        this.view.render(this.model.data);
      })
    },
    bindEvents() {
      $(this.view.el).on('click', 'li', (e) => {
        this.view.activeItem(e.currentTarget);
      })
    },
    bindEventHub() {
      window.eventHub.on('upload', () => {
        this.view.clearActive();
      });
      window.eventHub.on('create', songData => {
        this.model.data.songs.push(songData);
        this.view.render(this.model.data);
      })
    }
  }

  controller.init(view, model);
}