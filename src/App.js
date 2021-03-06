import React from 'react';
import { Route } from 'react-router-dom';
import ListBooks from './ListBooks';
import SearchBooks from './SearchBooks';
import * as BooksAPI from './BooksAPI';
import formatData from './utils/FormatData';
import './App.css';

class BooksApp extends React.Component {

  state = {
    books : []
  }

  bookshelves = [
    {shelf: "currentlyReading", shelfTitle: "Currently Reading"},
    {shelf: "wantToRead",       shelfTitle: "Want To Read"},
    {shelf: "read",             shelfTitle: "Did Read"}
  ];

  fetchBooksFromDB() {
    BooksAPI.getAll().then((booksAPIData) => {

      // sift and reformat data before storing it into state
      const books = formatData(booksAPIData)
      this.setState({ books });
    })
  }

  componentDidMount() {
      this.fetchBooksFromDB();
  }

  // checks all shelves from an API.update response to see if the "deleted"
  //  book is (still in) the database, or was indeed successfullly deleted.
  isInDB(id, response) {
    let foundBook = false;
    for (let shelf in response){
      if (shelf.indexOf(id) !== -1 ) {
        foundBook = true;
      }
    }
    return foundBook;
  }

  deleteBook(book, response) {
    // verify book has been removed from DB before removing from state
    if (! this.isInDB(book.id, response)) {
      this.setState((prevState) => (
        {books: prevState.books
          .filter((myBook) => (myBook.id !== book.id))
        }
      ));
    };
  }

  moveBook(book, newShelf, response){
    // handles adding a book to DB,
    //  as well as moving existing book to different shelf

    // Verify book was updated to newShelf in DB, before updating our state
    if (response[newShelf].indexOf(book.id) !== -1) {
      book.shelf = newShelf;

      // remove book, then add it back to array, with its new shelf value
      this.setState((prevState) => (
        {
          books: prevState.books
          .filter((aBook) => (aBook.id !== book.id))
          .concat([book])    // `concat([]) returns a new array, for chaining
        }
      ));
    }
  }

  changeBookshelf(book, newShelf){
    // update database
    BooksAPI.update(book, newShelf)
      .then((response) => {

        // then update state
        if (newShelf === 'none') {
          this.deleteBook(book, response);
        } else {
          this.moveBook(book, newShelf, response);
        }
      })
  }

  render() {
    return (

      <div className="app">

        <Route path="/search" render={() => (
          <SearchBooks
            onChangeBookshelf={ (aBook, newShelf) => {
              this.changeBookshelf(aBook, newShelf)}}
            bookshelves={this.bookshelves}
            booksInDB={this.state.books}
            fetchBooksFromDB={this.fetchBooksFromDB}
            />
        )} />

        <Route exact path="/" render={() => (
          <ListBooks
            books={this.state.books}
            onChangeBookshelf={ (aBook, newShelf) => {
              this.changeBookshelf(aBook, newShelf)} }
            bookshelves={this.bookshelves}
          />
        )} />

      </div>
    );

  }
}

export default BooksApp
