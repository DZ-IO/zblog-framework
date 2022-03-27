// ZBLOG default framework

window.onload = () => {
  // 常量
  // 版心容器
  const container = "div#container";
  // 顶部区
  const header = document.querySelector(container + ">header");
  // 内容区
  const content = document.querySelector(container + ">#content");

  // 解析地址栏参数
  let query = Qs.parse(window.location.search.split("?")[1]);
  // 主页 or 文章
  if (query.article) {
    // 文章
    fetch(`/article/${query.article}`)
      .then((val) => {
        return val.text();
      })
      .then((val) => {
        const converter = new showdown.Converter();
        content.innerHTML = converter.makeHtml(val);
        buildPage(document.querySelector(container + ">#content>h1").innerText);
      });
  } else {
    // 主页
    // 拿到RSS信息
    let rssAddr = document
      .querySelector('link[type="application/rss+xml"]')
      .getAttribute("href");
    // 实例化解析器
    let parser = new RSSParser();
    // 解析RSS
    parser.parseURL(rssAddr, function (err, feed) {
      //   错误处理
      if (err) throw err;
      // 大标题
      {
        // 创建元素
        let element = document.createElement("h1");
        // 标题标记
        element.className = "blogTitle";
        // 创建链接
        {
          let link = document.createElement("a");
          link.innerText = feed.title;
          link.setAttribute("href", feed.link);
          element.appendChild(link);
        }
        // 加入
        header.appendChild(element);
      }
      // 副标题/描述
      if (feed.title !== feed.description && feed.description) {
        // 创建元素
        let element = document.createElement("h3");
        // 标题标记
        element.className = "blogDescription";
        // 加入内容
        element.innerText = feed.title;
        // 加入
        header.appendChild(element);
      }
      // 倒序排列
      feed.items.reverse();
      // 处理所有项目
      feed.items.forEach(function (entry) {
        // 新建项目
        let item = document.createElement("div");
        //   标题
        {
          // 创建元素
          let element = document.createElement("h4");
          // 标题标记
          element.className = "itemTitle";
          // 创建链接
          {
            let link = document.createElement("a");
            link.innerText = entry.title;
            link.setAttribute("href", entry.link);
            element.appendChild(link);
          }
          // 加入
          item.appendChild(element);
        }
        //   时间和作者
        {
          // 创建元素
          let element = document.createElement("div");
          // 标题标记
          element.className = "itemContent";
          // 加入内容
          // 时间
          if (entry.isoDate) {
            let time = document.createElement("span");
            time.innerText = moment(entry.isoDate).format(
              "YYYY-M-D, h:mm:ss a "
            );
            element.appendChild(time);
          }
          // 作者
          {
            let creator = document.createElement("span");
            creator.innerText = entry.creator;
            element.appendChild(creator);
          }
          // 加入
          item.appendChild(element);
        }
        //   内容
        {
          // 创建元素
          let element = document.createElement("div");
          // 标题标记
          element.className = "itemContent";
          // 加入内容
          element.innerHTML = entry.content;
          // 加入
          item.appendChild(element);
        }
        //   加入项目
        content.appendChild(item);
      });
      buildPage();
    });
  }
};

function buildPage(pageTitle = null) {
  fetch("/cfg.json")
    .then((payload) => {
      return payload.json();
    })
    .then((val) => {
      const title = document.querySelector("title");
      if (pageTitle) {
        title.innerText = `${pageTitle} - ${val.title}`;
      } else {
        title.innerText = val.title;
      }
      document.querySelector("span#copyright").innerHTML = val.copyright;
    });
}
