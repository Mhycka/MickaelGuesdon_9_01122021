 import { screen } from "@testing-library/dom"
 import Actions from "../views/Actions.js"
 import '@testing-library/jest-dom/extend-expect'
 
 
 describe('Given I am connected as an Employee', () => {
   describe('When I am on Bills page and there are bills', () => {
     test(('Then, it should render icon eye to view an image'), () => {
       const html = Actions('', 'myFile.jpg')
       document.body.innerHTML = html
       expect(screen.getByTestId('icon-eye')).toBeTruthy()
     })
     test(('Then, it should render icon download to view an image'), () => {
       const html = Actions('', 'myFile.pdf')
       document.body.innerHTML = html
       expect(screen.getByTestId('icon-download')).toBeTruthy()
     })
     test(('Then, it should render nothing if is not an image or a pdf'), () => {
       const html = Actions('', 'myFile.ext')
       document.body.innerHTML = html
       expect(html).toBe('')
     })
   })
   describe('When I am on Bills page and there are bills with url for an image', () => {
     test(('Then, it should save given url in data-bill-url custom attribute'), () => {
       const url = '/fake_url'
       const html = Actions(url, 'myFile.jpg')
       document.body.innerHTML = html
       expect(screen.getByTestId('icon-eye')).toHaveAttribute('data-bill-url', url)
     })
   })
 })