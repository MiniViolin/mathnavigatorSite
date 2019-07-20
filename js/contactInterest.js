'use strict';
require('./../styl/contactInterestModal.styl');
import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router-dom';
import { Modal } from './modal.js';
import { getProgramClass, getAvailableClasses } from './repos/mainRepo.js';
const classnames = require('classnames');
const queryString = require('query-string');

export class ContactInterestSection extends React.Component {
  constructor(props) {
    super(props);
    var interested = [];

    var parsed = parseQuery();
    if (parsed.interest) {
      interested.push(parsed.interest);
    }

    this.state = {
      showModal: false,
      interested: interested
    };

    this.onSelectProgram = this.onSelectProgram.bind(this);
    this.onToggleShowModal = this.onToggleShowModal.bind(this);
  }

  onToggleShowModal() {
    const show = this.state.showModal;
    var newShow = !show;
    this.setState({
      showModal: newShow
    });
  }

  onSelectProgram(classKey, selected) {
    var interestedList = this.state.interested;
    if (selected) {
      interestedList.push(classKey);
    } else {
      interestedList = _.pull(interestedList, classKey);
    }
    this.setState({
      interested: interestedList
    });
  }

  render() {
    const interestedClasses = this.state.interested || [];
    const interestedSection = generateInterested(interestedClasses, this.onToggleShowModal);
    const interestModal = <InterestModal
                  onSelectProgram={this.onSelectProgram}
                  interested={interestedClasses}
                  onDismiss={this.onToggleShowModal}/>;
    return (
      <div>
        <h2>Interested Programs</h2>
        {interestedSection}
        <Modal content={interestModal}
          show={this.state.showModal}
          onDismiss={this.onToggleShowModal}>
        </Modal>
      </div>
    );
  }
}

class InterestModal extends React.Component {
  render() {
    const interestedClasses = this.props.interested || [];
    var interestClassMap = {};
    interestedClasses.forEach((classKey) => {
      interestClassMap[classKey] = true;
    });
    const numClasses = interestedClasses.length;

    var classesPair = getAvailableClasses();
    var classesAvail = classesPair.available;
    var classesSoon = classesPair.soon;

    var selectedLineClassNames = classnames("selected-line", {
      highlight: numClasses > 0
    });
    var selectedLineText = numClasses;
    selectedLineText += (numClasses == 1 ? " class " : " classes ");
    selectedLineText += "selected";

    const onSelectProgram = this.props.onSelectProgram;
    const listAvail = createInterestItems(classesAvail, interestClassMap, onSelectProgram);
    const listSoon = createInterestItems(classesSoon, interestClassMap, onSelectProgram);

    return (
      <div id="interest-modal">
        <h1>Interested Programs</h1>
        <div id="interest-headers">
          <div className="header class-name">Class</div>
          <div className="header times">Times</div>
          <div className="header start-date">Starting Date</div>
        </div>
        <div id="interest-view">
          <ul>
            <h2>Classes Available</h2>
            {listAvail}
            <h2>Classes Coming Soon</h2>
            {listSoon}
          </ul>
        </div>
        <div className={selectedLineClassNames}>{selectedLineText}</div>
        <button className="btn-done" onClick={this.props.onDismiss}>Done</button>
      </div>
    );
  }
}

class InterestItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      highlighted: this.props.selected || false
    }
    this.handleSelected = this.handleSelected.bind(this);
  }

  handleSelected(classKey) {
    var selected = this.state.highlighted;
    var newSelected = !selected;
    this.setState({
      highlighted: newSelected
    });
    if (this.props.onSelect) {
      var classKey = this.props.classObj.key;
      this.props.onSelect(classKey, newSelected);
    }
  }

  render() {
    const classObj = this.props.classObj;
    const className = classObj.fullClassName;
    const startingDate = classObj.startDate;

    const liClassNames = classnames("", {
      "highlight": this.state.highlighted
    });

    const times = classObj.times.map((time, index) =>
      <div key={index}>{time}</div>
    );

    return (
      <li className={liClassNames}>
        <input type="checkbox" name="interest" value="program"
              onChange={this.handleSelected}
              checked={this.props.selected}/>
        <div className="class-name">{className}</div>
        <div className="times">{times}</div>
        <div className="start-date">{startingDate}</div>
      </li>
    );
  }
}

/* Helper Functions */
function generateInterested(interestedList, onClick) {
  var nonEmpty = interestedList.length > 0;
  var interestedButtonText = nonEmpty ? "Select More Programs..." : "Select Programs...";
  if (nonEmpty) {
    var numClasses = interestedList.length;
    var numClassText = numClasses == 1 ? numClasses + " class." : numClasses + " classes."

    const selectedText = interestedList.map(function(classKey, index) {
      var pair = getProgramClass(classKey);
      var programTitle = pair.programObj.title;
      var className = pair.classObj.className;
      var fullName = className ? programTitle + " " + className : programTitle;
      var url = "/class/" + classKey;
      return (
        <Link key={index} to={url}>{fullName}</Link>
      );
    });

    return (
      <div id="contact-section-interested">
        <p>
          You have selected {numClassText}<br/>
          {selectedText}
        </p>
        <button className="inverted" onClick={onClick}>
          {interestedButtonText}
        </button>
      </div>
    );
  } else {
    return (
      <button className="inverted" onClick={onClick}>
        {interestedButtonText}
      </button>
    );
  }
}

function createInterestItems(listClasses, interestedMap, onSelect) {
  return listClasses.map(function(classObj, index) {
    var isSelected = interestedMap[classObj.key] || false;
    return (
      <InterestItem key={index}
                classObj={classObj}
                selected={isSelected}
                onSelect={onSelect}/>
    );
  });
}

function parseQuery() {
  var hash = window.location.hash;
  var i = hash.indexOf("?");
  var parsed = {};
  if (i > 0) {
    hash = hash.slice(i);
    parsed = queryString.parse(hash);
  }
  return parsed;
}
