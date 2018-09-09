{
  let view = {
    el: '.page > main',
    template: `
      <h1>新建歌单</h1>
      <form class="form">
        <div class="row">
          <label>歌名</label><input name="name" value="__key__" type="text">
        </div>
        <div class="row">
          <label>歌手</label><input name="singer" value="__singer__" type="text">
        </div>
        <div class="row">
          <label>链接</label><input name="url" value="__url__" type="text">
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
      let placeholders = ['key', 'url', 'singer', 'id'];
      let html = this.template;
      placeholders.map((string) => {
        html = html.replace(`__${string}__`, data[string] || '');
      });
      $(this.el).html(html);
    },
    reset() {
      $(this.el).find('input[type="text"]').map((index, input) => {
        input.value = ''
      });
    }
  }

  let model = {
    data: {
      name: '', singer: '', url: '', id: '',
    },
    create(data) {
      // 声明一个 song 类型
      var Song = AV.Object.extend('Song');
      // 新建一个 song 对象
      var song = new Song();
      song.set('name', data.name);
      song.set('singer', data.singer);
      song.set('url', data.url);
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
      window.eventHub.on('upload', (data) => { 
        this.view.render(data);
      })
    },
    bindEvents() {
      this.view.$el.on('submit', 'form', e => {
        e.preventDefault(); 
        let needs = 'name singer url'.split(' ');
        let data = {};
        needs.map(string => {
          data[string] = this.view.$el.find(`[name='${string}']`).val();
        });
        this.model.create(data).then( () => {
          this.view.reset();
          console.log(this.model.data);
          window.eventHub.emit('create', this.model.data); // 确认每次传递的 this.model.data 为一个全新的对象
        });
      })
    },
  }
  controller.init(view, model);
}