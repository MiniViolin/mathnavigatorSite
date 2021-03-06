'use strict';
require('./contact.styl');
import React from 'react';
import ReactDOM from 'react-dom';
import { ContactInterestSection } from './contactInterest.js';
import {
  EmailModal,
  STATE_NONE,
  STATE_EMPTY,
  STATE_LOADING,
  STATE_SUCCESS,
  STATE_FAIL
} from '../modals/emailModal.js';
import { sendEmail, sendTestEmail } from '../repos/emailRepo.js';
import {
  EmailCheck,
  SchoolCheck,
  GradeCheck,
  NameCheck,
  PhoneCheck
} from '../forms/formInputChecks.js';
import { FormInput } from '../forms/formInput.js';
import { pull } from 'lodash';
import { Modal } from '../modals/modal.js';
const classnames = require('classnames');

export class ContactForm extends React.Component {
	constructor(props) {
    super(props);

		this.state = {
      submitState: STATE_NONE,
			studentFirstName: "",
			studentLastName: "",
			studentGrade: 0,
			studentSchool: "",
			studentPhone: "",
			studentEmail: "",
			guardFirstName: "",
			guardLastName: "",
			guardPhone: "",
			guardEmail: "",
      guardSocialWeChat: "",
			interestedPrograms: this.props.startingInterest,
			additionalText: "",
      generatedEmail: null
		};

    this.handleSubmit = this.handleSubmit.bind(this);
    this.onSubmitSuccess = this.onSubmitSuccess.bind(this);
    this.onSubmitFail = this.onSubmitFail.bind(this);
    this.dismissModal = this.dismissModal.bind(this);

		this.getInputInfo = this.getInputInfo.bind(this);
		this.updateCb = this.updateCb.bind(this);
    this.updateInterested = this.updateInterested.bind(this);
		this.updateTextArea = this.updateTextArea.bind(this);

    this.checkAllInputs = this.checkAllInputs.bind(this);
  }

	updateCb(propertyName, newValue) {
		var obj = {};
		obj[propertyName] = newValue;
		this.setState(obj);
	}

  updateInterested(classKey, selected) {
    var interestedList = this.state.interestedPrograms;
    if (selected) {
      interestedList.push(classKey);
    } else {
      interestedList = pull(interestedList, classKey);
    }
    this.setState({
      interestedPrograms: interestedList
    });
  }

	updateTextArea(event) {
		this.updateCb("additionalText", event.target.value);
	}

	render() {
    const submitState = this.state.submitState;
    const modalContent = <EmailModal
                            loadingState={submitState}
                            failText={this.state.generatedEmail}/>;
    const showModal = submitState != STATE_NONE;

    const formCompleted = this.checkAllInputs();
    const submitBtnClass = classnames({active: formCompleted});
    const onHandleSubmit = formCompleted ? this.handleSubmit : undefined;

		return (
      <div>
        <Modal content={modalContent}
                show={showModal}
                persistent={true}
                onDismiss={this.dismissModal}/>
        <div className="section input">
          <h2>Student Information</h2>
          <div className="contact-input-container">
            <FormInput addClasses="student-fname" title="First Name" propertyName="studentFirstName"
                  onUpdate={this.updateCb} validator={NameCheck}/>
            <FormInput addClasses="student-lname" title="Last Name" propertyName="studentLastName"
                  onUpdate={this.updateCb} validator={NameCheck}/>
          </div>
          <div className="contact-input-container">
            <FormInput addClasses="student-grade" title="Grade" propertyName="studentGrade"
                  onUpdate={this.updateCb} validator={GradeCheck}/>
            <FormInput addClasses="student-school" title="School" propertyName="studentSchool"
                  onUpdate={this.updateCb} validator={SchoolCheck}/>
          </div>
          <div className="contact-input-container">
            <FormInput addClasses="student-phone" title="Phone" propertyName="studentPhone"
                  onUpdate={this.updateCb} validator={PhoneCheck}/>
            <FormInput addClasses="student-email" title="Email" propertyName="studentEmail"
                  onUpdate={this.updateCb} validator={EmailCheck}/>
          </div>

          <h2>Guardian Information</h2>
          <div className="contact-input-container">
            <FormInput addClasses="guard-fname" title="First Name" propertyName="guardFirstName"
                  onUpdate={this.updateCb} validator={NameCheck}/>
            <FormInput addClasses="guard-lname" title="Last Name" propertyName="guardLastName"
                  onUpdate={this.updateCb} validator={NameCheck}/>
          </div>
          <div className="contact-input-container">
            <FormInput addClasses="guard-phone" title="Phone" propertyName="guardPhone"
                  onUpdate={this.updateCb} validator={PhoneCheck}/>
            <FormInput addClasses="guard-email" title="Email" propertyName="guardEmail"
                  onUpdate={this.updateCb} validator={EmailCheck}/>
          </div>
          <div className="contact-input-container">
            <FormInput addClasses="guard-social-wechat" title="WeChat username" propertyName="guardSocialWeChat"
                  onUpdate={this.updateCb} placeholder={"(Optional)"}/>
          </div>
        </div>
				<div className="section interested">
					<ContactInterestSection interested={this.state.interestedPrograms}
                                  onUpdate={this.updateInterested}/>
				</div>

				<div className="section additional">
					<h2>Additional Information</h2>
					<textarea onChange={this.updateTextArea} placeholder="(Optional)"/>
        </div>

        <div className="section submit">
          <div className="submit-container">
            <button className={submitBtnClass} onClick={onHandleSubmit}>
              Submit
            </button>
            <p>
              Information will be sent to:<br/>
              <a>andymathnavigator@gmail.com</a>
            </p>
          </div>
        </div>

        <div className="section errors">
          <ContactErrorReminder formState={this.state}/>
        </div>
      </div>
		);
	}

	getInputInfo() {
		return {
			studentFirstName: this.state.studentFirstName,
			studentLastName: this.state.studentLastName,
			studentGrade: this.state.studentGrade,
			studentSchool: this.state.studentSchool,
			studentPhone: this.state.studentPhone,
			studentEmail: this.state.studentEmail,
			guardFirstName: this.state.guardFirstName,
			guardLastName: this.state.guardLastName,
			guardPhone: this.state.guardPhone,
			guardEmail: this.state.guardEmail,
      guardSocialWeChat: this.state.guardSocialWeChat,
			interestedPrograms: this.state.interestedPrograms,
			additionalText: this.state.additionalText
		};
	}

  checkAllInputs() {
    return validateStudent(this.state) &&
            validateGuardian(this.state) &&
            validatePrograms(this.state.interestedPrograms);
  }

	handleSubmit(event) {
    event.preventDefault();

		var inputInfo = this.getInputInfo();
		const emailMessage = generateEmailMessage(inputInfo);

    console.log("Sending email... " + emailMessage);
    this.setState({
      submitState: STATE_LOADING,
      generatedEmail: emailMessage
    });

    sendEmail(emailMessage, this.onSubmitSuccess, this.onSubmitFail);
    if (process.env.NODE_ENV === 'production') {
      mixpanel.track("contactSubmit");
    }
	}

	onSubmitSuccess() {
    setTimeout(() => {
      this.setState({ submitState: STATE_EMPTY });
      setTimeout(() => {
        console.log("Email success!");
        this.setState({ submitState: STATE_SUCCESS });
      }, 400);
    }, 3600);

    if (process.env.NODE_ENV === 'production') {
      mixpanel.track("contactSubmitSuccess");
    }
	}

	onSubmitFail() {
    setTimeout(() => {
      this.setState({ submitState: STATE_EMPTY });
      setTimeout(() => {
        console.log("Email fail!");
        this.setState({ submitState: STATE_FAIL });
      }, 400);
    }, 3600);

    if (process.env.NODE_ENV === 'production') {
      mixpanel.track("contactSubmitFail");
    }
	}

  dismissModal() {
    console.log("Dismiss modal");
    this.setState({
      submitState: STATE_LOADING
    });
  }
}

class ContactErrorReminder extends React.Component {
  render() {
    const formState = this.props.formState;
    var errorNotif;
    var errorStudent;
    var errorGuardian;
    var errorPrograms;

    if (!validateStudent(formState)) {
      errorStudent = <li>Please completely fill your student information.</li>;
    }
    if (!validateGuardian(formState)) {
      errorGuardian = <li>Please completely fill your guardian information.</li>;
    }
    if (!validatePrograms(formState.interestedPrograms)) {
      errorPrograms = <li>Pick at least one program.</li>;
    }
    if (errorStudent || errorGuardian || errorPrograms) {
      errorNotif = <li>Please correctly fill the form in order to submit!</li>;
    }

    return (
      <ul>
        {errorNotif}
        {errorStudent}
        {errorGuardian}
        {errorPrograms}
      </ul>
    );
  }
}

/* Helper functions */
function validateStudent(state) {
  return NameCheck.validate(state.studentFirstName)
          && NameCheck.validate(state.studentLastName)
          && GradeCheck.validate(state.studentGrade)
          && SchoolCheck.validate(state.studentSchool)
          && PhoneCheck.validate(state.studentPhone)
          && EmailCheck.validate(state.studentEmail);
}

function validateGuardian(state) {
  return NameCheck.validate(state.guardFirstName)
          && NameCheck.validate(state.guardLastName)
          && PhoneCheck.validate(state.guardPhone)
          && EmailCheck.validate(state.guardEmail);
}

function validatePrograms(programs) {
  return programs.length > 0;
}

function generateEmailMessage(info) {
	if (!info) {
		return null;
	}
	return [
    "<html>",
    "<body>",
    "<h1>New Register</h>",
    "<h2>Interested Programs: " + JSON.stringify(info.interestedPrograms) + "</h2>",
    "<h2>Student: " + info.studentFirstName + "	&nbsp; " + info.studentLastName + "</h2>",
    "<h3>Grade:" + info.studentGrade + "</h3>",
    "<h3>School: " + info.studentSchool + "</h3>",
    "<h3>Phone: " + info.studentPhone + "</h3>",
    "<h3>Email: " + info.studentEmail + "</h3>",
    "<br/>",
    "<h2>Guardian: " + info.guardFirstName + "	&nbsp; " + info.guardLastName + "</h2>",
    "<h3>Phone: " + info.guardPhone + "</h3>",
    "<h3>Email: " + info.guardEmail + "</h3>",
    "<h3>WeChat: " + info.guardSocialWeChat + "</h3>",
    "<br/>",
    "<p>Additional Info: " + info.additionalText + "</p>",
    "</body>",
    "</html>"
	].join("\n");
}
