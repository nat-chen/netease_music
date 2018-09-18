{
  let view = {
    el: '.page > main',
    template: `
      <form class="form">
        <div class="row">
          <label>歌名</label><input name="name" value="__name__" type="text">
        </div>
        <div class="row">
          <label>歌手</label><input name="singer" value="__singer__" type="text">
        </div>
        <div class="row">
          <label>链接</label><input name="url" value="__url__" type="text">
        </div>
        <div class="row">
          <label>封面</label><input name="cover" value="__cover__" type="text">
        </div>
        <div class="row">
          <label>歌词</label><textarea  style="resize: none;" cols="50" rows="10" name="lyrics">__lyrics__</textarea>
        </div>
        <div class="row actions">
          <input type="submit" value="提交">
        </div>
      <form>
    `,
    init() {
      this.$el = $(this.el);
    },
    render(data = {}) {
      let placeholders = ['name', 'url', 'singer', 'id', 'cover', 'lyrics'];
      let html = this.template;
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '');
      });
      $(this.el).html(html);
      if (data.id) {
        $(this.el).prepend('<h1>编辑歌曲</h1>')
      } else {
        $(this.el).prepend('<h1>新建歌曲</h1>')
      }
    },
    reset() {
      $(this.el).find('input[type="text"]').map((index, input) => {
        input.value = ''
      });
    }
  }

  let model = {
    data: {
      name: '', singer: '', url: '', id: '', cover: '', 'lyrics': '',
    },
    update(data) {
      Object.assign(this.data, data);
      var song = AV.Object.createWithoutData('Song', this.data.id);
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      song.set('lyrics', data.lyrics);
      return song.save();
    },
    create(data) {
      // 声明一个 song 类型
      var Song = AV.Object.extend('Song');
      // 新建一个 song 对象
      var song = new Song();
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
      song.set('cover', data.cover);
      song.set('lyrics', data.lyrics);
      return song.save().then((newSong) => {
        // 成功保存之后，执行其他逻辑.
        let { id, attributes } = newSong;
        this.data = { id, ...attributes };
        // Object.assign(this.data, { id, ...attributes }); //结果影响原对象 this.data
      }, function (error) {
        // 异常处理
        console.error('Failed to create new object, with error message: ' + error.message);
      });
    }
  };

  let controller = {
    init(view, model) {
      this.view = view;
      this.model = model;
      this.view.init();
      this.bindEvents();
      this.view.render(this.model.data);
      window.eventHub.on('new', (data) => { 
        if (this.model.data.id) {
          this.model.data = {
            name: '', url: '', id: '', singer: '', cover: '', lyrics: '',
          };
        } else {
          Object.assign(this.model.data, data); //data 可能为 undefined 来自 new_song
        }
        this.view.render(this.model.data);
      });
      window.eventHub.on('select', data => {
        this.model.data = data;
        this.view.render(this.model.data);
      });
    },
    create() {
      let needs = 'name singer url cover lyrics'.split(' ');
      let data = {};
      needs.map(string => {
        data[string] = this.view.$el.find(`[name='${string}']`).val();
      });
      this.model.create(data).then( () => {
        this.view.reset();
        let string = JSON.stringify(this.model.data);
        let object = JSON.parse(string);
        window.eventHub.emit('create', object); // 确认每次传递的 this.model.data 为一个全新的对象
      });
    },
    update() {
      let needs = 'name singer url cover lyrics'.split(' ');
      let data = {};
      needs.map(string => {
        data[string] = this.view.$el.find(`[name="${string}"]`).val();
      })
      this.model.update(data).then(() => {
        window.eventHub.emit('update', JSON.parse(JSON.stringify(this.model.data)));
      });
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', e => {
        e.preventDefault(); 
        if (this.model.data.id) {
          this.update();
        } else {
          this.create();
        }
      })
    },
  }
  controller.init(view, model);
}