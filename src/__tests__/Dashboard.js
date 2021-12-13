import { fireEvent, screen } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import DashboardFormUI from "../views/DashboardFormUI.js"
import DashboardUI from "../views/DashboardUI.js"
import Dashboard, { filteredBills, cards, card } from "../containers/Dashboard.js"
import { ROUTES } from "../constants/routes"
import { localStorageMock } from "../__mocks__/localStorage.js"
import firebase from "../__mocks__/firebase"
import { bills } from "../fixtures/bills"


describe('Given I am connected as an Admin', () => {
  describe('When I am on Dashboard page, there are bills, and there is one pending', () => {
    test('Then, filteredBills by pending status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "pending")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is one accepted', () => {
    test('Then, filteredBills by accepted status should return 1 bill', () => {
      const filtered_bills = filteredBills(bills, "accepted")
      expect(filtered_bills.length).toBe(1)
    })
  })
  describe('When I am on Dashboard page, there are bills, and there is two refused', () => {
    test('Then, filteredBills by accepted status should return 2 bills', () => {
      const filtered_bills = filteredBills(bills, "refused")
      expect(filtered_bills.length).toBe(2)
    })
  })
  describe('When I am on Dashboard page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      const htmlrender = DashboardUI({ loading: true })
      document.body.innerHTML = htmlrender
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })
  describe('When I am on Dashboard page but i have an error message', () => {
    test('Then, Error page should be rendered', () => {
      const htmlrender = DashboardUI({ error: 'some error message' })
      document.body.innerHTML = htmlrender
      expect(screen.getAllByText('Erreur')).toBeTruthy()
    })
  })

  describe('When I am on Dashboard page and I click on arrow/s list', () => {
    test('Then, tickets list has deployed', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const dashboardPage = new Dashboard({
        document, onNavigate, firestore: null, bills, localStorage: window.localStorage
      })          
      const htmlrender = DashboardUI({ data: bills })
      document.body.innerHTML = htmlrender    
      const handleShowTickets1 = jest.fn((e) => dashboardPage.handleShowTickets(e, bills, 1)) 
      const handleShowTickets2 = jest.fn((e) => dashboardPage.handleShowTickets(e, bills, 2))    
      const handleShowTickets3 = jest.fn((e) => dashboardPage.handleShowTickets(e, bills, 3))    
      const arrowIcon1 = screen.getByTestId('arrow-icon1')
      const arrowIcon2 = screen.getByTestId('arrow-icon2')
      const arrowIcon3 = screen.getByTestId('arrow-icon3')

      arrowIcon1.addEventListener('click', handleShowTickets1)
      userEvent.click(arrowIcon1)
      expect(handleShowTickets1).toHaveBeenCalled()
      userEvent.click(arrowIcon1)

      arrowIcon2.addEventListener('click', handleShowTickets2)
      userEvent.click(arrowIcon2)
      expect(handleShowTickets2).toHaveBeenCalled()

      arrowIcon3.addEventListener('click', handleShowTickets3)
      userEvent.click(arrowIcon3)
      expect(handleShowTickets3).toHaveBeenCalled()
    })
  })

  describe('When I am on Dashboard page and I click on icon card', () => {
    test('Then, form should be filled', () => {
      bills.forEach((bill) => document.body.append(card(bill)))
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      const dashboardPage = new Dashboard({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })

      const handleEditTicket = jest.fn((e) => dashboardPage.handleEditTicket(e, bills[0], bills))   
      const iconEditCard = screen.getByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      iconEditCard.addEventListener('click', handleEditTicket)
      userEvent.click(iconEditCard)
      expect(handleEditTicket).toHaveBeenCalled()
      userEvent.click(iconEditCard)
      expect(handleEditTicket).toHaveBeenCalled()
    })
  })

  describe('When I am on Dashboard and there are no bills', () => {
    test('Then, no cards can be show', () => {
      const htmlrender = cards([])
      document.body.innerHTML = htmlrender
      const iconEditCard = screen.queryByTestId('open-bill47qAXb6fIm2zOKkLzMro')
      expect(iconEditCard).toBeNull()
    })
  })
})

describe('Given I am connected as Admin, I am on Dashboard page and I clicked on a pending bill', () => {
  describe('When I click on accept button', () => {
    test('I should be sent on Dashboard', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const htmlrender = DashboardFormUI(bills[0])
      document.body.innerHTML = htmlrender
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboardPage = new Dashboard({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })

      const acceptBtn = screen.getByTestId("btn-accept-bill-d")
      const handleAcceptSubmit = jest.fn((e) => dashboardPage.handleAcceptSubmit(e, bills[0]))
      acceptBtn.addEventListener("click", handleAcceptSubmit)
      fireEvent.click(acceptBtn)
      expect(handleAcceptSubmit).toHaveBeenCalled()
      const billedIcon = screen.queryByTestId("big-billed-icon")
      expect(billedIcon).toBeTruthy()
    })
  })
  describe('When I click on refuse button', () => {
    test('I should be sent on Dashboard', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const htmlrender = DashboardFormUI(bills[0])
      document.body.innerHTML = htmlrender
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboardPage = new Dashboard({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })
      const refuseBtn = screen.getByTestId("btn-refuse-bill-d")
      const handleRefuseSubmit = jest.fn((e) => dashboardPage.handleRefuseSubmit(e, bills[0]))
      refuseBtn.addEventListener("click", handleRefuseSubmit)
      fireEvent.click(refuseBtn)
      expect(handleRefuseSubmit).toHaveBeenCalled()
      const billedIcon = screen.queryByTestId("big-billed-icon")
      expect(billedIcon).toBeTruthy()
    })
  })
})

describe('Given I am connected as Admin and I am on Dashboard page and I clicked on a bill', () => {
  describe('When I click on the icon eye', () => {
    test('A modal open', () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Admin'
      }))
      const htmlrender = DashboardFormUI(bills[0])
      document.body.innerHTML = htmlrender
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }
      const firestore = null
      const dashboardPage = new Dashboard({
        document, onNavigate, firestore, bills, localStorage: window.localStorage
      })

      const handleClickIconEye = jest.fn(dashboardPage.handleClickIconEye)
      const eyeIcon = screen.getByTestId('icon-eye-d')
      eyeIcon.addEventListener('click', handleClickIconEye)
      userEvent.click(eyeIcon)
      expect(handleClickIconEye).toHaveBeenCalled()

      const modalForm = screen.getByTestId('modaleFileAdmin')
      expect(modalForm).toBeTruthy()
    })
  })
})

/*---------------- test d'intégration GET--------------------*/


describe("When I navigate to Bills Page", () => {
  test("fetch bills fom API ", async () => {
    const spyGet = jest.spyOn(firebase, "get")       
    const userBills = await firebase.get()
    expect(spyGet).toHaveBeenCalledTimes(1)
    expect(userBills.data.length).toBe(4)
  })
  test("fetch bills from an API and fails with 404 error", async () => {
    firebase.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 404"))
    )
    const htmlrender = DashboardUI({ error: "Erreur 404" })
    document.body.innerHTML = htmlrender
    const messageError = await screen.getByText(/Erreur 404/)
    expect(messageError).toBeTruthy()
  })
  test("fetch messages from an API and fails with 500 error", async () => {
    firebase.get.mockImplementationOnce(() =>
      Promise.reject(new Error("Erreur 500"))
    )
    const htmlrender = DashboardUI({ error: "Erreur 500" })
    document.body.innerHTML = htmlrender
    const messageError = await screen.getByText(/Erreur 500/)
    expect(messageError).toBeTruthy()
  })
})