import React from 'react';
import Book from './Book';
import PropTypes from 'prop-types';

const Bookshelf = function(props){

  const { books, shelfTitle, shelf, bookshelves } = props;
  const message = props.message ||  "Dusting off your books.. "

  return (
    <div className="bookshelf">
      <h2 className="bookshelf-title">{shelfTitle}</h2>
      <div className="bookshelf-books">
        <ol className="books-grid">

          {/* show books */}
          {books.filter((book) => (book.shelf === shelf))
                .map((book) => (
                  <li key={book.id}>
                    <Book
                      book={book}
                      onChangeBookshelf={props.onChangeBookshelf}
                      bookshelves={bookshelves}
                  /></li>
          ))}

          {books.length === 0 && (
            <p>{message}</p>
          )}

        </ol>
      </div>
    </div>
  );
};

Bookshelf.propTypes = {
  books: PropTypes.array.isRequired,
  shelfTitle: PropTypes.string.isRequired,
  message: PropTypes.string,
  shelf: PropTypes.string.isRequired,
  onChangeBookshelf: PropTypes.func.isRequired,
  bookshelves: PropTypes.array.isRequired
};
// prop.bookshelves and onChangeBookshelf are passed in, only to be
//   passed down to <BookshelfChanger/>.


export default Bookshelf;
