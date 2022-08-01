(function () {
  'use strict';
  // Helpers
  const getPercentChange = (coin, period) => {
    const histPrice = coin.histPrices[period] || coin.histPrices['24H'];
    const change = coin.price.USD - histPrice.USD;
    const changePercent = (change / histPrice.USD) * 100;
    return +changePercent.toFixed(3);
  };

  const getTemplateItem = (coin, isShowSymbol, isShowIcon, isShowPeriod, period, theme) => {
    const periodTemplate = () => {
      const percentChange = getPercentChange(coin, period);
      return `
    <div class="cr-marquee-item__change cr-marquee-item-change">
      <span class="cr-marquee-item-change__${percentChange > 0 ? 'up' : 'down'}">
        ${percentChange}%
      </span>
    </div>`;
    };
    return `
    <a class="cr-marquee-item cr-marquee-item__${theme}" href='https://cryptorank.io/price/${coin.key}' target='_blank'>
      <div class="cr-marquee-item__coin cr-marquee-item-coin">
        ${isShowIcon ? `<img class="cr-marquee-item-coin__icon" src="${coin.image.icon}"  alt="coin icon"/>` : ''}
        <span class="cr-marquee-item-coin__name">${isShowSymbol ? `${coin.name} (${coin.symbol})` : coin.name}</span>
      </div>

      <div class="cr-marquee-item__price">
        <span>$${coin.price.USD.toFixed(2)}</span>
      </div>

      ${isShowPeriod ? periodTemplate() : ''}
    </a>
  `;
  };

  const getTemplateLabelLink = () => {
    return `
      <svg class='cr-marquee-label__logo' viewBox='0 0 22.924 22.924' fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.924,15.206c0,0.619-0.508,1.111-1.127,1.111c-0.619,0-1.111-0.492-1.111-1.111V3.825
          L1.909,22.603c-0.429,0.429-1.143,0.429-1.587,0c-0.429-0.444-0.429-1.143,0-1.587L19.099,2.254H7.734
          c-0.619,0-1.127-0.508-1.127-1.127S7.115,0,7.734,0h14.063c0.619,0,1.127,0.508,1.127,1.127V15.206z"/>
      </svg>
      <span class='cr-marquee-label__text-wrap'><span class='cr-marquee-label__text'>CRYPTORANK</span></span>
  `;
  };

  const getStyleAnimationForLine = (animationName, duration) => {
    return `animation: ${animationName} ${duration}s linear 0.5s infinite;`;
  };

  const getPeriodChange = (period) => {
    const possiblePeriods = ['24H', '7D', '30D', '3M', '6M', '1Y', 'YTD'];
    return possiblePeriods.indexOf(period) < 0 ? '24H' : period;
  };

  const getSettings = (dataset) => {
    let coins;
    if (!dataset.coins) {
      console.warn(
        'No coins were found to be displayed, symbols in the date attribute. Bitcoin is selected by default'
      );
      coins = ['bitcoin', 'ethereum', 'tether', 'ripple', 'cardano'];
    } else {
      coins = dataset.coins.split(',');
    }

    return {
      coins,
      theme: dataset.theme || 'light',
      speed: Number(dataset.speed) || 35,
      isShowIcon: dataset.showIcon !== 'false',
      isShowPeriodChange: dataset.showPeriodChange !== 'false',
      isShowSymbol: dataset.showSymbol !== 'false',
      periodChange: dataset.periodChange || '24H',
      apiUrl: dataset.apiUrl || 'https://api.cryptorank.io/v0',
      siteUrl: dataset.siteUrl || 'https://cryptorank.io',
    };
  };

  const getStyleKeyframes = (animationName, width) => {
    return `
    @keyframes ${animationName} {
      to {
        transform: translateX(-${width.line}px);
      }
    }
  `;
  };

  const createDomElement = (tag, className = '', content = '') => {
    const box = document.createElement(tag);

    if (Array.isArray(className)) {
      className.forEach((c) => box.classList.add(c));
    } else {
      box.classList.add(className);
    }

    box.innerHTML = content;

    return box;
  };

  const createDuplicatesLines = (width, container, line) => {
    let countLine = width.container / width.line;
    if (countLine > 1) {
      countLine = +countLine.toFixed();
    } else if (countLine < 1) {
      countLine = 0;
    }
    countLine += 1; // + duplicate, to hide the interrupt
    for (let i = 0; i < countLine; i++) {
      container.append(line.cloneNode(true));
    }
  };

  const getStyles = () => {
    return `
    .cr-marquee-line {
      white-space: nowrap;
      display: flex;
    }

    #cr-widget-marquee {
      margin: 0;
      padding: 0;
      font-family: Trebuchet MS, Helvetica, sans-serif;
      position: relative;
    }

    #cr-widget-marquee > * {
      box-sizing: border-box;
    }

    .cr-widget-marquee-container {
      display: flex;
      overflow: hidden;
      position: relative;
      border-radius: 3px;
      font-size: 16px;
      border: 1px solid #e0e3eb;
    }

    .cr-widget-marquee-container__light {
      background: #fff;
    }

    .cr-widget-marquee-container__dark {
      background: #131516;
    }

    .cr-widget-marquee-container:hover > * {
      animation-play-state: paused !important;
    }

    .cr-marquee-item {
      cursor: pointer;
      display: flex;
      align-items: center;
      height: 24px;
      padding: 0 16px;
      position: relative;
      text-decoration: none;
    }

    .cr-marquee-item__light .cr-marquee-item-coin__name {
      color: #262b3e;
    }

    .cr-marquee-item__dark .cr-marquee-item-coin__name {
      color: rgb(200, 196, 189);
    }

    .cr-marquee-item:after {
      position: absolute;
      content: '';
      height: 20px;
      width: 1px;
      left: 0;
      background-color: #d6d8e0;
    }

    .cr-marquee-item__light:hover {
      background: #f8f9fd;
    }

    .cr-marquee-item__dark:hover {
        background-color: rgb(27, 29, 30);
    }

    .cr-marquee-item-coin__name {
      font-weight: 700;
    }

    .cr-marquee-item-coin__icon {
      width: 16px;
      height: 16px;
      margin-right: 7px;
      position: relative;
    }

    .cr-marquee-item__coin,
    .cr-marquee-item__price,
    .cr-marquee-item__change {
      display: flex;
      align-items: center;
    }

    .cr-marquee-item__light .cr-marquee-item__price {
      color: #242428;
    }

    .cr-marquee-item__dark .cr-marquee-item__price {
      color: #fff;
    }

    .cr-marquee-item__change {
      margin-left: 16px;
    }

    .cr-marquee-item__coin {
      margin-right: 16px;
      width: -webkit-max-content;
      width: -moz-max-content;
      width: max-content;
    }

    .cr-marquee-item-change {
      color: #e53935;
    }

    .cr-marquee-item-change__up {
      color: #00897b;
    }

    .cr-marquee-item-change__down {
      color: #e53935;
    }

    .cr-marquee-label {
      position: absolute;
      right: 1px;
      top: 8px;
      text-decoration: none;
      border-radius: 12px 0 0 12px;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      font-size: 12px;
      z-index: 900;
      transition: background 0.3s cubic-bezier(0.4, 0.01, 0.22, 1) 0s;
      overflow: hidden;
      min-width: 24px;
      height: 24px;
      box-shadow: -1px 0 3px 0 rgba(0, 0, 0, 0.16);
      color: #ffffff;
      background-color: #ffffff;
    }

    .cr-marquee-label__dark {
      background-color: rgb(34, 37, 49);
    }

    .cr-marquee-label:hover {
      background: #0079fb;
    }

    .cr-marquee-label:hover > .cr-marquee-label__logo {
      fill: #ffffff;
    }

    .cr-marquee-label:hover > .cr-marquee-label__text-wrap {
      max-width: 120px;
    }

    .cr-marquee-label__logo {
      width: 12px;
      height: 12px;
      margin: 5px 6px 5px 8px;
      fill: #0079fb;
    }

    .cr-marquee-label__text-wrap {
      transition: max-width 0.6s cubic-bezier(0.4, 0.01, 0.22, 1) 0s;
      display: inline-block;
      width: 100%;
      padding: 0;
      max-width: 0;
    }

    .cr-marquee-label__text {
      padding-right: 5px;
    }
  `;
  };

  class MarqueeWidget {
    constructor(container, settings) {
      this.animationName = 'cr-marquee-' + Math.floor(Math.random() * 10000000);
      this.duration = 0;
      this.intervalUpdate = 300000;
      this.container = container;
      this.apiUrl = settings.apiUrl;
      this.siteUrl = settings.siteUrl;
      this.animationSpeed = settings.speed; // px in 1 second
      this.isShowIcon = settings.isShowIcon;
      this.theme = settings.theme || 'light';
      this.isShowPeriodChange = settings.isShowPeriodChange;
      this.isShowSymbol = settings.isShowSymbol;
      this.periodChange = getPeriodChange(settings.periodChange);
      this.initStyles(); // styles first, then template
      this.getCoinData(settings.coins);
      this.timerId = setInterval(() => this.getCoinData(settings.coins), this.intervalUpdate);
    }

    static init() {
      const { container: containerSelector } = MarqueeWidget.selectors;
      const containerNode = document.querySelector(containerSelector);
      if (!containerNode || containerNode.tagName !== 'DIV') {
        throw Error(`
          Container for widget-marquee, by selector '${containerSelector}' not found.
          Make sure you copy and paste all the code correctly.
        `);
      }
      const settings = getSettings(containerNode.dataset);
      new MarqueeWidget(containerNode, settings);
    }

    getCoinData(coinsKey) {
      const requests = coinsKey.map((key) => fetch(`${this.apiUrl}/coins/${key}`));
      Promise.all(requests)
        .then((responses) => Promise.all(responses.map((response) => response.json())))
        .then((data) =>
          data.filter((item, index) => {
            if (!item.data || item.statusCode) {
              console.error(`Error when requesting coin data by key '${coinsKey[index]}'`, item);
            }

            return item.data && !item.statusCode;
          })
        )
        .then((coins) => coins.map((coin) => coin.data))
        .then((arrCoin) => this.initTemplateMarquee(arrCoin))
        .catch((e) => {
          throw Error(`Coins data not received. Error: ${e}`);
        });
    }

    initTemplateMarquee(coins) {
      this.container.innerHTML = '';
      const coinsTemplate = coins.map((coin) => {
        return getTemplateItem(
          coin,
          this.isShowSymbol,
          this.isShowIcon,
          this.isShowPeriodChange,
          this.periodChange,
          this.theme
        );
      });
      const line = createDomElement('div', 'cr-marquee-line', coinsTemplate.join(''));
      const containerLines = createDomElement('div', [
        'cr-widget-marquee-container',
        `cr-widget-marquee-container__${this.theme}`,
      ]);
      const urlRef = createDomElement(
        'a',
        ['cr-marquee-label', `cr-marquee-label__${this.theme}`],
        getTemplateLabelLink()
      );
      urlRef.setAttribute('href', this.siteUrl);
      urlRef.setAttribute('target', 'blank');
      containerLines.append(line);
      this.container.append(containerLines, urlRef);
      const width = {
        container: containerLines.offsetWidth,
        line: line.offsetWidth,
      };
      this.duration = width.line / this.animationSpeed;
      line.style.cssText = getStyleAnimationForLine(this.animationName, this.duration);
      createDuplicatesLines(width, containerLines, line);
      this.initKeyframes(width);
    }

    initStyles() {
      const style = document.createElement('style');
      style.innerHTML = getStyles();
      document.head.append(style);
    }

    initKeyframes(width) {
      const style = document.createElement('style');
      style.innerHTML = getStyleKeyframes(this.animationName, width);
      this.container.append(style);
    }

    destroy() {
      // Не используется
      clearInterval(this.timerId);
    }
  }

  MarqueeWidget.selectors = {
    container: '#cr-widget-marquee',
  };

  if (document.readyState === 'complete') {
    MarqueeWidget.init();
  } else {
    window.addEventListener('load', () => MarqueeWidget.init());
  }
})();
