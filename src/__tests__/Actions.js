 import { screen } from "@testing-library/dom"
 import Actions from "../views/Actions.js"
 import '@testing-library/jest-dom/extend-expect'
 
 
 describe('Given I am connected as an Employee', () => {
   describe('When I am on Bills page and there are bills', () => {
     test(('Then, it should render icon eye'), () => {
       const htmlaction = Actions('', 'fileTest.jpg')
       document.body.innerHTML = htmlaction
       expect(screen.getByTestId('icon-eye')).toBeTruthy()
     })
     test(('Then, it should render icon download'), () => {
       const htmlaction = Actions('', 'myFile.pdf')
       document.body.innerHTML = htmlaction
       expect(screen.getByTestId('icon-download')).toBeTruthy()
     })
     test(('Then, it should render nothing if wrong file format'), () => {
       const html = Actions('', 'myFile.ext')
       document.body.innerHTML = html
       expect(html).toBe('')
     })
   })


   describe('When I am on Bills page and there are bills with url', () => {
     test(('Then, it should save given url in custom attribute'), () => {
       const urltest = '/test_url'
       const htmlaction = Actions(urltest, 'myFile.jpg')
       document.body.innerHTML = htmlaction
       expect(screen.getByTestId('icon-eye')).toHaveAttribute('data-bill-url', urltest)
     })
   })
 })