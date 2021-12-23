import { screen, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import Router from '../app/Router.js'
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes"
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


    test("Then bills should be ordered", () => {
      const htmlrender = BillsUI({ data: bills }, {formatDate: false})
      document.body.innerHTML = htmlrender
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })


    describe('actually loading', () => {
      test('Then i should see Loading page', () => {
        const htmlrender = BillsUI({ loading: true })
        document.body.innerHTML = htmlrender
        expect(screen.getAllByText('Loading...')).toBeTruthy()
      })
    })


    describe('can/t find data', () => {
      test('Then i should see error page', () => {
        const htmlrender = BillsUI({ error: 'some error message' })
        document.body.innerHTML = htmlrender
        expect(screen.getAllByText('Erreur')).toBeTruthy()
      })  
    })


    describe('i click on', () => {
      let billsList;
      beforeEach(() => {
          Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
          window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// Set user as Employee in localStorage
          const html = BillsUI({ data: bills })
          document.body.innerHTML = html
          $.fn.modal = jest.fn()
          billsList = new Bills({
            document,
            onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
            firestore: null,
            localStorage: window.localStorage
          })     
      })

      describe('the icon eye', () => {
        test('Then i should see a modal window', () => {
          const eyeicon = screen.getAllByTestId('icon-eye')[0]
          const handleClickIconEye = jest.fn(billsList.handleClickIconEye(eyeicon))      
          eyeicon.addEventListener('click', handleClickIconEye)
          fireEvent.click(eyeicon)
          expect(handleClickIconEye).toHaveBeenCalled()
          expect(screen.getByTestId('modaleFile')).toBeTruthy()         
        })
      })

      describe('the New Bill button', () => {
        test('Then it should display the New Bill Page', () => {
          const handleClickNewBill = jest.fn(billsList.handleClickNewBill)
          const btnNewBill = screen.getByTestId('btn-new-bill')
          expect(btnNewBill).toBeTruthy()
          btnNewBill.addEventListener('click', handleClickNewBill)
          fireEvent.click(btnNewBill)
          expect(screen.getByText('Envoyer une note de frais')).toBeTruthy() 
        })        
      })
    })
  })





  /* -------------------Integration test Get Bills---------------------*/

  describe("When I navigate to Bills Page", () => {
    test("fetch bills from API ", async () => {
      const spyGet = jest.spyOn(firebase, "get")       
      const userBills = await firebase.get()
      expect(spyGet).toHaveBeenCalledTimes(1)
      expect(userBills.data.length).toBe(4)
    })
    test("fetch bills from an API and fails with 404 error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const htmlrender = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = htmlrender
      const messageError = await screen.getByText(/Erreur 404/)
      expect(messageError).toBeTruthy()
    })
    test("fetch messages from an API and fails with 500 error", async () => {
      firebase.get.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const htmlrender = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = htmlrender
      const messageError = await screen.getByText(/Erreur 500/)
      expect(messageError).toBeTruthy()
    })
  })
})