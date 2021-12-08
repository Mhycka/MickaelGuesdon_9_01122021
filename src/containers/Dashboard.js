import { formatDate } from '../app/format.js'
import DashboardFormUI from '../views/DashboardFormUI.js'
import BigBilledIcon from '../assets/svg/big_billed.js'
import { ROUTES_PATH } from '../constants/routes.js'
import USERS_TEST from '../constants/usersTest.js'
import Logout from "./Logout.js"

export const filteredBills = (data, status) => {
  return (data && data.length) ?
    data.filter(bill => {

      let selectCondition

      if (typeof jest !== 'undefined') {
        selectCondition = (bill.status === status)
      } else {
        const userEmail = JSON.parse(localStorage.getItem("user")).email
        selectCondition =
          (bill.status === status) &&
          [...USERS_TEST, userEmail].includes(bill.email)
      }

      return selectCondition
    }) : []
}

/**
 * Render a bill card
 * @param {object} bill 
 * @param {string} bill.type
 * @param {string} bill.date
 * @param {string} bill.id
 * @param {string} bill.email
 * @param {string} bill.name
 * @param {number} bill.amount
 * @returns {HTMLElement}
 */
export const card = (bill) => {
  const name = bill.email.split('@')[0].replace('.', ' ');// Format name
  const date = (bill.date) ? formatDate(bill.date) : 'Aucune date fournis'; // Format date
  const element = document.createElement('div');
  element.classList.add('bill-card');
  element.setAttribute('id', 'open-bill' + bill.id);
  element.dataset.testid = 'open-bill' + bill.id;
  element.innerHTML = `
    <div class='bill-card-name-container'>
      <div class='bill-card-name'>${name}</div>
      <span class='bill-card-grey'> ... </span>
    </div>
    <div class='name-price-container'>
      <span> ${bill.name} </span>
      <span> ${bill.amount} € </span>
    </div>
    <div class='date-type-container'>
      <span> ${date} </span>
      <span> ${bill.type} </span>
    </div>
  `;
  return element;
}

export const cards = (bills) => {
  return bills && bills.length ? bills.map(bill => card(bill)).join("") : ""
}

export const getStatus = (index) => {
  switch (index) {
    case 1: return "pending";
    case 2: return "accepted";
    case 3: return "refused";
  }
}

export default class {
  constructor({ document, onNavigate, firestore, bills, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.firestore = firestore
    this.billsStatusState = {
      1: false,
      2: false,
      3: false,
    };
    $('#arrow-icon1').click((e) => this.handleShowTickets(e, bills, 1))
    $('#arrow-icon2').click((e) => this.handleShowTickets(e, bills, 2))
    $('#arrow-icon3').click((e) => this.handleShowTickets(e, bills, 3))
    this.getBillsAllUsers()
    new Logout({ localStorage, onNavigate })
  }

  handleClickIconEye = () => {
    const billUrl = $('#icon-eye-d').attr("data-bill-url")
    const imgWidth = '100%';//Math.floor($('#modaleFileAdmin1').width() * 0.8)
    $('#modaleFileAdmin1').find(".modal-body").html(`<div style='text-align: center;'><img width=${imgWidth} src=${billUrl} /></div>`)
    if (typeof $('#modaleFileAdmin1').modal === 'function') $('#modaleFileAdmin1').modal('show')
  }

  handleEditTicket(e, bill, bills) {
    if (this.counter === undefined || this.id !== bill.id) this.counter = 0
    if (this.id === undefined || this.id !== bill.id) this.id = bill.id
    if (this.counter % 2 === 0) {
      bills.forEach(b => {
        $(`#open-bill${b.id}`).css({ background: '#0D5AE5' })
      })
      $(`#open-bill${bill.id}`).css({ background: '#2A2B35' })
      $('.dashboard-right-container div').html(DashboardFormUI(bill))
      $('.vertical-navbar').css({ height: '150vh' })
      this.counter ++
    } else {
      $(`#open-bill${bill.id}`).css({ background: '#0D5AE5' })

      $('.dashboard-right-container div').html(`
        <div id="big-billed-icon"> ${BigBilledIcon} </div>
      `)
      $('.vertical-navbar').css({ height: '120vh' })
      this.counter ++
    }
    $('#icon-eye-d').click(this.handleClickIconEye)
    $('#btn-accept-bill').click((e) => this.handleAcceptSubmit(e, bill))
    $('#btn-refuse-bill').click((e) => this.handleRefuseSubmit(e, bill))
  }

  handleAcceptSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'accepted',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }

  handleRefuseSubmit = (e, bill) => {
    const newBill = {
      ...bill,
      status: 'refused',
      commentAdmin: $('#commentary2').val()
    }
    this.updateBill(newBill)
    this.onNavigate(ROUTES_PATH['Dashboard'])
  }
  /**
   * handleShowTickets
   * @param {MouseEvent} e 
   * @param {Array} bills 
   * @param {number} index 
   * @returns {Array}
   */
  handleShowTickets(e, bills, index) {
    this.billsStatusState[index] = !this.billsStatusState[index];// Toggle
    this.index = index;
    const elArrow = document.getElementById('arrow-icon' + index);
    const elContainer = document.getElementById('status-bills-container' + index);
    if (this.billsStatusState[index]) {// Show bills
      elArrow.style.transform = 'rotate(0deg)';
      const status = getStatus(index);
      const filteredData = filteredBills(bills, status);
      filteredData.forEach((bill) => {
        const el = card(bill);
        el.addEventListener('click', (e) => {
          this.handleEditTicket(e, bill, bills)
        })
        elContainer.append(el);
      })
    } else {// Hide Bills
      elArrow.style.transform = 'rotate(90deg)';
      elContainer.innerHTML = '';
    }
    return bills;
  }

  // not need to cover this function by tests
  getBillsAllUsers = () => {
    if (this.firestore) {
      return this.firestore
      .bills()
      .get()
      .then(snapshot => {
        const bills = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date,
          status: doc.data().status
        }))
        return bills
      })
      .catch(console.log)
    }
  }
    
  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.firestore) {
    return this.firestore
      .bill(bill.id)
      .update(bill)
      .then(bill => bill)
      .catch(console.log)
    }
  }
}