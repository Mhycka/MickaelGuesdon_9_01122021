import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import Router from '../app/Router.js'
import Firestore from "../app/Firestore";
import firebase from "../__mocks__/firebase";


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", () => {
      Firestore.bills = () => ({ bills, get: jest.fn().mockResolvedValue()})
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      Object.defineProperty(window, "location", { value: { hash: ROUTES_PATH['Bills'] } });
      document.body.innerHTML = `<div id="root"></div>`
      Router();
      expect(screen.getByTestId('icon-window').classList.contains('active-icon')).toBe(true)
    })



    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills }, {formatDate: false})
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })



    describe('but it\'s loading', () => {
      test('Then i should see Loading page', () => {
        const html = BillsUI({ loading: true })
        document.body.innerHTML = html
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })



    describe('but data can\'t be loaded', () => {
      test('Then i should see error page', () => {
        const html = BillsUI({ error: 'some error message' })
        document.body.innerHTML = html
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })  
    })



    describe('and I click on', () => {
      let billsList;
      beforeEach(() => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })
          window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
          const html = BillsUI({ data: bills })
          document.body.innerHTML = html
          $.fn.modal = jest.fn()// Prevent jQuery error
          billsList = new Bills({
            document,
            onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
            firestore: null,
            localStorage: window.localStorage
          })     
      })

      describe('the icon eye', () => {
        test('Then i should see a modal open', () => {
          const eyeIcon = screen.getAllByTestId('icon-eye')[0]// Get first
          const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eyeIcon))      
          eyeIcon.addEventListener('click', handleClickIconEye)
          fireEvent.click(eyeIcon)
          expect(handleClickIconEye).toHaveBeenCalled()
          expect(screen.getByTestId('modaleFile')).toBeTruthy()         
        })
      })

      /**
       * Test new bill button
       */
      describe('the New Bill button', () => {
        test('Then it should display the New Bill Page', () => {
          const handleClickNewBill = jest.fn(billsList.handleClickNewBill)
          const buttonNewBill = screen.getByTestId('btn-new-bill')
          expect(buttonNewBill).toBeTruthy()
          buttonNewBill.addEventListener('click', handleClickNewBill)
          fireEvent.click(buttonNewBill)
          expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() 
        })        
      })
    })
  })

  /**
   * GET integration test
   */
  describe("When I navigate to Bills Page", () => {
    test("fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(firebase, "get")       
      const userBills = await firebase.get()
      expect(getSpy).toHaveBeenCalledTimes(1)
      expect(userBills.data.length).toBe(4)
    })
    test("fetches bills from an API and fails with 404 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })
    test("fetches messages from an API and fails with 500 message error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})