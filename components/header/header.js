'use strict';
require('./header.styl');
import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { NavLinks, isPathAt } from '../constants.js';
const classNames = require('classnames');
const headerIcon = require('../../assets/navigate_white.png');

export class Header extends React.Component {
	render() {
		return (
      <div id="view-header">
        <div id="view-header-container">
          <HeaderLogo/>
          <HeaderMenu/>
        </div>
      </div>
		);
	}
}

class HeaderLogo extends React.Component {
  render() {
    return (
      <a id="header-logo" href="/">
        <img src={headerIcon}/>
        <h1 className="logo"></h1>
      </a>
    );
  }
}

class HeaderMenu extends React.Component {
  constructor() {
      super();
      this.state = {
        show: false
      };
      this.toggleMenu = this.toggleMenu.bind(this);
  }

  toggleMenu() {
    this.setState({
      show: !this.state.show
    });
  }

  render() {
    const show = this.state.show;
    var buttonClasses = classNames("header-menu-btn", {
      "show": show
    });
    var iconClasses = classNames("icon-arrow", {
      "show": show
    });
    return (
      <div className="header-menu-container">
        <button className={buttonClasses} onClick={this.toggleMenu}>
          Menu
          <div className={iconClasses}></div>
        </button>
        <HeaderMenuList showMenu={show} toggleMenu={this.toggleMenu}/>
      </div>
    );
  }
}

class HeaderMenuList extends React.Component {
  render() {
		const toggleMenu = this.props.toggleMenu
    const showMenu = this.props.showMenu;
    const numLinks = NavLinks.length;
    const items = NavLinks.map((link, i) =>
      <MenuLink key={link.id} title={link.name} url={link.url} onClick={toggleMenu}/>
    );
    const menuClasses = classNames("header-menu-list", {
      "show": showMenu
    });
    return (
      <div className={menuClasses}>
        <ul>
          {items}
        </ul>
      </div>
    );
  }
}

class MenuLink extends React.Component {
  render() {
		var url = this.props.url;
		const linkClasses = classNames("",
			{"active": isPathAt(url)}
		);
    return (
    	<Link className={linkClasses} to={url} onClick={this.props.onClick}>
        <li>
    		  <div>{this.props.title}</div>
        </li>
    	</Link>
		);
  }
}