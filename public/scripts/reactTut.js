var data = [
  {author: "Conan Doyle", text: "This is first comment"},
  {author: "Jack London", text: "This is another comment"}
];
var CommentBox = React.createClass({
  loadCommentsFromServer: function(){
    $.ajax({
      url: this.props.url,
      dataType: "json",
      cache: false,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  handleCommentSubmit: function(comment){
    //submit to server and refresh the comment list
    var comments = this.state.data;
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: "json",
      type: "POST",
      data: comment,
      success: function(data){
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err){
        console.log(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function(){
    return {data: []};
  },
  componentDidMount: function(){
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  render:
    function(){
      return (
        <div className="commentBox">
          <h1>Comments</h1>
          <CommentList data={this.state.data}/>
          <CommentForm onCommentSubmit={this.handleCommentSubmit}/>
        </div>
      );
    },
});

var CommentList = React.createClass({
  render: function(){
    var commentNodes = this.props.data.map(function(comment) {
      return (
          <Comment author={comment.author}>
            {comment.text}
          </Comment>
        );
    });
    return (
      <div className="commentList">
        {commentNodes}
      </div>
    );
  }
});

var CommentForm = React.createClass({
  handleSubmit: function(e){
    e.preventDefault();
    var author = React.findDOMNode(this.refs.author).value.trim();
    var text = React.findDOMNode(this.refs.text).value.trim();
    if(!text || !author){
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    React.findDOMNode(this.refs.author).value = "";
    React.findDOMNode(this.refs.text).value = "";
  },
  render: function(){
    return (
      <form className="commentForm" onSubmit={this.handleSubmit}>
        <input type="text" placeholder="Your name" ref="author"/>
        <input type="text" placeholder="Say something" ref="text"/>
        <input type="submit" value="Post"/>
      </form>
    );
  }
});

var Comment = React.createClass({
  render: function(){
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true})
    return (
        <div className="comment">
          <h2 className="commentAuthor">
            {this.props.author}
          </h2>
         <span dangerouslySetInnerHTML={{__html: rawMarkup}} />
        </div>
      );
  }
})

React.render(
    <CommentBox url="comments.json" pollInterval={2000}/>,
    document.getElementById("content")
 );


// this part for product list

var ProductCategoryRow = React.createClass({
  render: function(){
    return (
      <tr><th colSpan="2">{this.props.category}</th></tr>
      );
  }
});

var ProductRow = React.createClass({
  render: function(){
    var name = this.props.product.stocked ? this.props.product.name : <span sytle={{color: "red"}}>{this.props.product.name}</span>;
    return (
      <tr>
        <td>{name}</td>
        <td>{this.props.product.price}</td>
      </tr>
      );
  }
});

var ProductTable = React.createClass({
  render: function(){
    var rows = [];
    var lastCategory = null;
    this.props.products.forEach(function(product){
      if(product.category !== lastCategory){
        rows.push(<ProductCategoryRow category={product.category} key={product.cateogry} />);
      }
      rows.push(<ProductRow product={product} key={product.name} />);
      lastCategory = product.category;
    });
    return (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      );
  }
});

var SearchBar = React.createClass({
  render: function(){
    return (
      <form>
        <input type="text" placeholder="Search..." />
        <p>
          <input type="checkbox" />
          {" "}
          Only show product in stock
        </p>
      </form>
      );
  }
});

var FilterableProductTable = React.createClass({
  render: function(){
    return (
      <div>
        <SearchBar />
        <ProductTable products={this.props.products} />
      </div>
      );
  }
});

var PRODUCTS = [
  {category: 'Sporting Goods', price: '$49.99', stocked: true, name: 'Football'},
  {category: 'Sporting Goods', price: '$9.99', stocked: true, name: 'Baseball'},
  {category: 'Sporting Goods', price: '$29.99', stocked: false, name: 'Basketball'},
  {category: 'Electronics', price: '$99.99', stocked: true, name: 'iPod Touch'},
  {category: 'Electronics', price: '$399.99', stocked: false, name: 'iPhone 5'},
  {category: 'Electronics', price: '$199.99', stocked: true, name: 'Nexus 7'}
];

React.render(<FilterableProductTable products={PRODUCTS} />, document.getElementById("products"));
