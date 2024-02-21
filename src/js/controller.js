import 'core-js/stable';
import 'regenerator-runtime/runtime';
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import bookmarksView from './views/bookmarksView.js';
import paginationView from './views/paginationView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js'

if (module.hot) {
  module.hot.accept();
}

const controlRecipes = async () => {
  try {
    const id = window.location.hash.slice(1);

    if (!id) {
      return;
    }
    recipeView.renderSpinner();

    resultsView.update(model.getSearchResultsPage());

    bookmarksView.update(model.state.bookmarks);

    await model.loadRecipe(id);

    const { recipe } = model.state;

    recipeView.render(recipe);
  } catch (err) {
    recipeView.renderError()
  }
}

const controlSearchResults = async () => {
  try {
    resultsView.renderSpinner();

    const query = searchView.getQuery();
    if (!query) {
      return;
    }

    await model.loadSearchResults(query);

    resultsView.render(model.getSearchResultsPage());

    paginationView.render(model.state.search);

  } catch (err) {
    console.log(err);
  }
}

const controlPagination = (goToPage) => {
  resultsView.render(model.getSearchResultsPage(goToPage));

  paginationView.render(model.state.search);
}

const controlServings = function (newServings) {
  model.updateServings(newServings);

  recipeView.update(model.state.recipe);
};

const controlAddBookmark = () => {
  if (!model.state.recipe.bookmarked) {
    model.addBookmark(model.state.recipe);
  } else {
    model.deleteBookmark(model.state.recipe.id)
  }

  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = () => {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async (newRecipe) => {
  try {
    addRecipeView.renderSpinner();

    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    recipeView.render(model.state.recipe);

    addRecipeView.renderMessage();

    bookmarksView.render(model.state.bookmarks);

    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(() => {
      addRecipeView.toggleWindow()
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.log('💥', 'Error:', err);
    addRecipeView.renderError(err.message)
  }

}

const init = () => {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
}

init();
