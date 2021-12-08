import { screen, fireEvent } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import BillsUI from "../views/BillsUI.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES } from '../constants/routes.js'
import firebase from "../__mocks__/firebase"
import Firestore from "../app/Firestore";

describe("Given I am connected as an employee and on NewBill Page", () => {
  let newBill;
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock })// Set localStorage
    window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))// Set user as Employee in localStorage
    const html = NewBillUI()
    document.body.innerHTML = html
    newBill = new NewBill({
      document,
      onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
      firestore: null,
      localStorage: window.localStorage
    })     
  })

  describe("When I select a file", () => {
    test("Then it should be changed in the input", () => {
      const handleChangeFile = jest.fn(newBill.handleChangeFile)
      const inputFile = screen.getByTestId("file")
      inputFile.addEventListener('change', handleChangeFile)
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["myProof.png"], "myProof.png", { type: "image/png" })]
        }
      })
      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0].name).toBe("myProof.png");
    })
  })


  
  describe("When I submit the form", () => {
    test('It should create a new bill', () => {
      const handleSubmit = jest.fn(newBill.handleSubmit)
      const newBillform = screen.getByTestId("form-new-bill")
      newBillform.addEventListener('submit', handleSubmit)
      fireEvent.submit(newBillform)
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})

/**
 * POST integration test
 */
 describe("Given I am connected as an employee", () => {
  describe("When I create a new bill", () => {
    const bill = {
      "id": "47qAXb6fIm2zOKkLzMro",
      "vat": "80",
      "fileName": "preview-facture-free-202105-pdf-1.jpg",
      "fileUrl": "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      "status": "pending",
      "type": "Hôtel et logement",
      "commentary": "Déplacement Florence",
      "name": "encore",
      "date": "2004-04-04",
      "amount": 400,
      "commentary": "séminaire billed",
      "email": "a@a.com",
      "pct": 20
    }

    test("post bill from mock API POST", async () => {
      const getSpy = jest.spyOn(firebase, "post")
      const request = await firebase.post(bill)
      expect(request.status).toBe(200)
    })

    test("post bill from mock API POST and fails with 404 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 404"))
      )
      const html = BillsUI({ error: "Erreur 404" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    /**
     * 500
     */
    test("post bill from mock API POST and fails with 500 message error", async () => {
      firebase.post.mockImplementationOnce(() =>
        Promise.reject(new Error("Erreur 500"))
      )
      const html = BillsUI({ error: "Erreur 500" })
      document.body.innerHTML = html
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
 })