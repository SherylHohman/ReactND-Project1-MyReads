import React, {Component } from 'react';
import { Link } from 'react-router-dom';
import Bookshelf from './Bookshelf';
import * as BooksAPI from './BooksAPI';
import formatData from './utils/FormatData';
import PropTypes from 'prop-types';

class SearchBooks extends Component {

  static propTypes = {
    booksInDB: PropTypes.array.isRequired,
    onChangeBookshelf: PropTypes.func.isRequired
    // bookshelves: PropTypes.array.isRequired
  }

  state = {
    query: '',
    booksSearch: [] , // not named books, to avoid confusion in ReactDevTools
    searchResultsTitle:  'Making Space on Your Shelves',
    searchResultsMessage: 'Let\'s find more books!',
    curSearchTerm: '',

    // alternate var names for booksSearch -- too Awkward, and *STILL* can't seem to make it "stick" - must keep looking it up. Therefore it's a terrible variable name.
    // books: [],
    // availBooks: [],
    // browsingBooks: [],
    // booksBrowsing: [],
    // queriedBooks: []
  }

  componentDidMount(){
     // if (this.state.query) {
      // this.getSearchResults();
      this.searchForBooks();
    // }
  }

  searchForBooks(query){
    console.log('searchForBooks:', query);

    // console.log('--in searchForBooks..');
    const myBooks = this.props.booksInDB;  // convenience

    BooksAPI.search(query).then((searchResults) => {

      console.log('fetched (allAPIdata): ', query, searchResults);

      // No books found
      if (searchResults === []){
        this.setState({
          booksSearch: [],
          searchResultsTitle: `${query}`,
          searchResultsMessage: `..Sorry, No Books Found. Let's try something else.`
        })
        console.assert((this.state.booksSearch===[]),
          'BUG: No Books Found, state SHOULD HAVE BEEN updated:',
            ', booksSearch:', this.state.booksSearch,
            ', title:', this.state.searchResultsTitle,
            ', message:', this.state.searchResultsMessage);

      } else {
      // Yea: valid search Term
        // remove books that are already in our DB
        const newBooksAPIdata = searchResults.filter((searchResult) => {
            return myBooks.every((myBook) => {
              return (myBook.id !== searchResult.id);
            });
        });

        // All books on this topic are already on shelves
        if (newBooksAPIdata === []) {
          this.setState({
            booksSearch: [],
            searchResultsTitle: `${query}`,
            searchResultsMessage: `..You already have all books on ${query} !`
          })
          console.assert((this.state.booksSearch===[]),
            'BUG: All Books on Shelves, state SHOULD HAVE BEEN updated:',
            ', booksSearch:', this.state.booksSearch,
            ', title:', this.state.searchResultsTitle,
            ', message:', this.state.searchResultsMessage);

        } else {
          // We have some books to show !

          // thin and reformat data before storing the remaining books into state
          const booksSearch = formatData(newBooksAPIdata);
          this.setState({
            booksSearch: booksSearch,
            searchResultsTitle: `${query} (${booksSearch.length})`,
            searchResultsMessage: ''
          });
          console.log('Books found!',
            ', title:', this.state.searchResultsTitle,
            ', message:', this.state.searchResultsMessage);
        }
      }

    });
    console.log('exiting..searchForBooks: state.booksSearch', this.state.booksSearch);
  }

  toTitleCaps(title){
    title = title.toLowerCase();
    if (title === 'ios'){
      title = 'iOS'
    }
    else {
      title = title
        .split(' ')
        .map((word) => word.replace(word[0], word[0].toUpperCase()))
        .join(' ');
    }
    return title;
  }

  stripQueryStr(query){
    // based on SEARCH_TERMS.md, only alphabetical letters & space are accepted
    return query
      .split(' ')
      .map((word) => (word.replace(/[^a-z\s]+/ig, '')))
      .join(' ')
    ;
    // TODO: BUG after a space, *sometimes* non-alpha chars get through ?!!??
    //  not critical, this is just a "helper" so user is *more likely* to enter
    //  only valid search terms.
  }

  updateQuery(e, query) {
    query = this.toTitleCaps(this.stripQueryStr(query));
    this.setState({ query: query.trim() });
  }

  clearQuery() {
    console.log('in clearQuery..');
    // console.log('resetting this.state.query to ""');
    this.setState( {query: ''} );
    console.assert((this.state.query === ''),
      '"' + this.state.query + '"',
      'is not equal to "" : in clearQuery()' );
    // weird.. assert message displays, even though search bar was cleared
    // ..also string substituion doesn't. & object literal notation unsupported
  }

  clearBooksSearch(){
    this.setState({booksSearch: []});
  }

  onSubmitHandler(e, query){
    e.preventDefault();
    this.searchForBooks(query);
    this.clearQuery();
  }

  render() {

    // from ListBooks. TODO move to App.js or a FormatData or util file
    const tempBookshelvesDUPLICATED = [
      {shelf: "currentlyReading", shelfTitle: "Currently Reading"},
      {shelf: "wantToRead",       shelfTitle: "Want To Read"},
      {shelf: "read",             shelfTitle: "Did Read"}
    ];

    return (
      <div className="search-books">

        <div className="search-books-bar">
          <Link to="/" className="close-search">
            Close
          </Link>

          <div className="search-books-input-wrapper">
            <form onSubmit={(e) => {this.onSubmitHandler(e, this.state.query)}}>
              <input
                type="text"
                placeholder="Search by title or author"
                value={this.state.query}
                onChange={ (event) => {this.updateQuery(event, event.target.value)} }
              />
              <button type="submit" hidden>Search for Books</button>

            </form>

          </div> {/* search-books-input-wrapper */}
        </div> {/* search-books-bar */}

        {this.state.booksSearch!==[] ? (
          <div className="search-books-results">
            <ol className="books-grid">
                <Bookshelf
                  books={this.state.booksSearch}
                  shelfTitle={this.state.searchResultsTitle}
                  shelf={'none'}
                  onChangeBookshelf={this.props.onChangeBookshelf}
                  bookshelves={tempBookshelvesDUPLICATED}/>
            </ol>
          </div> /* search-books-results */

        ) : (
          <p>Let's add some new books !</p>
        )}

        </div> /* search-books */
    );
  }
};

export default SearchBooks;

/*
  NOTES: The search from BooksAPI is limited to a particular set of search terms.
  You can find these search terms here:
  https://github.com/udacity/reactnd-project-myreads-starter/blob/master/SEARCH_TERMS.md

  However, remember that the BooksAPI.search method DOES search by title or author. So, don't worry if
  you don't find a specific author or title. Every search is limited by search terms.
*/

// TODO: Warning in console on SearchBooks Results, when click changeBookshelf
//    button:
//  [Violation] Added non-passive event listener to a scroll-blocking 'mousewheel'
//    event. Consider marking event handler as 'passive' to make the page more
//    responsive. See https://www.chromestatus.com/feature/5745543795965952

/* TODO:
    bookSearch Bookshelf
    - this code could be a component that gets sent in an "bookshelf array".
      It's the same code that gets mapped over in Bookshelf.
      Here, it could then map over (browsingShelf, above);
      and there, map over bookshelves.  Satisify the requirements for both.
    - On the other hand, I may want to include additional information
      for thebooks in this page. Such as Description, etc.
*/

// TODO: tempBookshelvesDUPLICATED
// REM Update and Remove
    //  copy of const "bookshelves" from ListBooks.
    //    SearchBooks and Bookshelf only need "bookshelves so it can be passed"
    //    down to changeBookshelves Component.
    //  ListBooks currently owns this data, and passes it down to Bookshelf,
    //    but it cannot pass it down to (here) SearchBooks

    //  Therefore, either BooksApp needs to own this data, so it can be passed
    //    both here, and to ListBooks, to be used and/or passed on down the line.
    //  Or, can move this const into utils folder. It *is* kind of realated to
    //    data and info that's stored on the server..

    //  Or can consider restructuring the app all together.
    //  FOR NOW, in order to see what BROWSING BOOKS looks like,
    //    get it MVP complete, see what it looks like, decide on layout, design
    //    and functionality of this component, I'll use this DUPLICATED ver.

/* BUG / Strange Behaviour
  feat: SearchBooks, changeShelf adds book to shelf

  BooksApp.books is updated to reflect book's new shelf locally.
  DB (supposedly) is also updated to reflect book's new shelf.

  However, there are some issues/bugs/strange behaviour:
    - Search on the same term, returns "moved" books. It should only be
      returning books *not* on a shelf. So something is wrong. Moved
      books should not appear in sebsequent searches. (unless removed)
    - ListBooks shows some of these books on *multiple* shelves.
      Book should reside on a single shelf only.
    - ReLoading the app, should pull from the DB books on the shelves
      and they should have remembered the last state I "set" them to.
    - changeBookshelves is not acting like a controlled component when
      called from the Search page.  In ListBooks, the current shelf is
      Highlighted on the dropdown menu. In Search, "Move To" is highlighted.
      from Search, I expected "none" to be highlighted, on all books listed
      (Perhaps this one is a simple oversight in not adding this feat.
      If I didnt make this one a controlled component, its not a bug.
      Just incomplete.)
*/

/* --- Epiffiny --- Suddently realized I Had Fundamental MisUnderstanding
******   OF How SearchAPI WORKS ** AND ** Whatis Stored in the  Database !! *****

  (It Seems obvious in hindsight, but lack of clarify, experience or explanats
    left me assuming the Searched Books were Part Of Our Database.
    Not So! *That* Design simply wouldn't make sense.
    It also explains why search, and getAll return Different, but similar data. )

  New Understamding ( hope I'm right this time - it * feels clean, and simple*)
  - Our DB *only* stores books that have been placed on a shelf.
  - when a book is "removed" from a shelf, AT THE API LEVEL,
    ie set to shelf: "none", it's "deleted" from the Database
  - so getAll(), literally fetched EVERYTHING our DB stores.
  - search(), goes out to a 3rd party and returns lists of books based on the
    search query provided.  Search() knows *nothing* about what is stored in
    our DB.  Books returned by search may or may not already be in our DB
  - When update() "adds" a book to DB, hmm.. maybe I'm wrong again afterall..
    hmm... well, I'm thinking that maybe it get() the book from 3rd party,
    copies ALL the fields/properties provides, and adds a new field: shelf,
    setting "shelf" to the desired shelf.  ..and my though was that it's in
    this way, that duplicat books have been added to DB.
    - But, why then would update() not behave in the same manner, thusly
      potentially duplicating books that were already in the DB also. ?
    - Oh. Duh. I never called update() on a book that *already existed on a shelf*
      On home page, every book is on a shelf. update.. hmm.. no that doesn't
      make sense. Dunno.
  Well, anyway. workaround.
  First. App front, where I've basically cached a copy of the DB locally,
    except that I'm holding onto fewer fields, clearly I need to make sure
    that changes are synched between the local representation of what I *think*
    (or intend to be) is in the DB, and what really is.
  Oh, maybe *that's* what I had realized. Perhaps locally I'd added a book twice.
  Yes, that it.
  So, when I search() for books, I need to filter out any book that's already in
    my DB. else (locally) it'll appear to be on a shelf and in 'none' at the
    same time.  Also, when I subsequently move a book "from 'none'" to a shelf,
    I'd actually be ADDING a second copy at the new shelf.
  So, after fetching books from a search(), look through my LOCAL
    representation of books in the DB, `BooksApp.state.books`,
      (searching the actual DB would be too expensive).
      And BooksApp.books *should* always be current
      (Indeed, I'm not calling etState() to update the local stash until *after* I receive confirmation from API that the change I requested was successful)
  *and remove* (`.filter` out) any book returned from search() API that already exists in BooksApp.state.books from the search() results. Now, send the remainer
  through FormatData, to add `shelf:none`, etc, and give *that* result back to SearchBooks.setstate..

  While it *seemed* that I was already doing this in FormatData - if `shelf`
    didn't exist in a set of books returned from API, it would ADD the
    `shelf: 'none'` property and value.
  Problem is, search() does not return books from our DB, it returns list from
    3rd party.  So, **ALL** books are missing the `shelf` property.
    So it is added to all books. Even ones that already exist in the DB.
  Therefore, checking API with DB (shortcut: local representation of DB),
    to remove books the user already has stored, will solve the DUPLICATED
    books (on front end) issue.
"removed" from our DB ()
*/

  // TODO: - Search Bar:
  //  either remove its "controlled aspect" (not required)
  // as it stands, search box does not need to be a controlled component
  // or advanced TODO: only update state if query (partial) matches a valid
  //    SEARCH_TERM.md
  // Corollary: only call API if query matches (exactly) a valid SEARCH_TERM
