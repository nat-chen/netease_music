{
  let view = {
    el: '#siteLoading',
    show() {
      console.log(1)
      $(this.el).addClass('active');
    },
    hide() {
      console.log(2)
      $(this.el).removeClass('active');
    }
  };

  let controller = {
    init(view) {
      this.view = view;
      this.bindEventHub();
    },
    bindEventHub() {
      window.eventHub.on('beforeUpload', () => {
        this.view.show();
      });
      window.eventHub.on('afterUpload', () => {
        this.view.hide();
      });
    },
  }

  controller.init(view);
}