"use strict";

import { isNumber } from "/app/common/object-utils/object-utils.js";

export const STATUS_IDLE = "Idle";
export const STATUS_LOADING = "Loading";

const clientsAdapter = RTK.createEntityAdapter();

const initialState = clientsAdapter.getInitialState({
  paginationData: {
    page: 1, // current page
    countPerPage: 5, // nb of clients per page
    totalCount: 0, // total number of clients, including the ones on the server
  },
  clients: [], // list of all available devices
  filters: {
    clientName: null, // filter by client name
  },
  status: STATUS_IDLE,
  errorMessage: null,
});

/**
 * Calculates the offset of the given page, and given the countPerPage.
 */
const calculatePageOffset = (page, countPerPage) => (page - 1) * countPerPage;

/**
 * Calculates the total pages count, given the totalCount of the clients and the countPerPage.
 */
const calculatePagesCount = (totalCount, countPerPage) => Math.ceil(totalCount / countPerPage);

/**
 * Calculates the total count of the clients using the right api call depending on the filters.
 */
const getTotalCount = async (clientsApi, filters) => {
  if (filters.clientName) {
    return await clientsApi.getClientsCountForName(filters.clientName);
  } else {
    return await clientsApi.getClientsCount();
  }
};

/**
 * Navigates the state to the given page, and updates pagination data.
 * @param {page} page - the page to navigate to. If less than 1, navigates to the first page. If greater than pagesCount, navigates to the last page.
 * @param {clientsApi} clientsApi - the clients API
 */
const goToPage = RTK.createAsyncThunk("clients/goToPage", async (args, utils) => {
  try {
    if (!isNumber(args.page)) {
      throw new Error("page must be a number");
    }
    const filters = filtersSelector(utils.getState());

    const currentPaginationData = paginationDataSelector(utils.getState());
    const countPerPage = currentPaginationData.countPerPage;

    const totalCount = await getTotalCount(args.clientsApi, filters);

    const pagesCount = calculatePagesCount(totalCount, countPerPage);

    let page = args.page;
    if (page < 1) {
      page = 1;
    } else if (page > pagesCount && pagesCount > 0) {
      page = pagesCount;
    }
    const offset = calculatePageOffset(page, countPerPage);

    // check if there is a filter on the client nme
    let clients = [];
    if (filters.clientName) {
      clients = await args.clientsApi.getClientsByNamePaginated(filters.clientName, offset, countPerPage, false);
    } else {
      clients = await args.clientsApi.getClientsPaginated(offset, countPerPage);
    }

    const updatedPaginationData = { ...currentPaginationData, page: page, totalCount: totalCount };

    return utils.fulfillWithValue({ clients, updatedPaginationData });
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Adds a client with the given name.
 * @param {clientName} clientName - the name of the client
 * @param {clientsApi} clientsApi - the clients API
 */
const addClient = RTK.createAsyncThunk("clients/addClient", async (args, utils) => {
  try {
    await args.clientsApi.addClient(args.clientName);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const clientsSlice = RTK.createSlice({
  name: "clients",
  initialState,
  reducers: {
    changeClientNameFilter(state, action) {
      state.filters.clientName = action.payload.clientName;
    },
    changeCountPerPage(state, action) {
      state.paginationData.countPerPage = action.payload.countPerPage;
    },
  },
  extraReducers: (builder) => {
    const defaultErrorMessage = "An error has occurred, please refresh the page.";
    // handle goToPage
    builder
      .addCase(goToPage.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(goToPage.fulfilled, (state, action) => {
        // update clients
        clientsAdapter.setAll(state, action.payload.clients);
        // update paginated data
        state.paginationData = action.payload.updatedPaginationData;

        state.status = STATUS_IDLE;
      })
      .addCase(goToPage.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle addClient
    builder
      .addCase(addClient.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(addClient.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });
  },
});

// Action Creators
export const clientsActions = {
  ...clientsSlice.actions,
  goToPage,
  addClient,
};

// Reducer
export default clientsSlice.reducer;

// Selectors
export const clientsListSelector = (state) => Object.values(state.clientsViewState.entities);

export const paginationDataSelector = (state) => state.clientsViewState.paginationData;

export const pagesCountSelector = (state) =>
  calculatePagesCount(paginationDataSelector(state).totalCount, paginationDataSelector(state).countPerPage);

export const statusSelector = (state) => state.clientsViewState.status;

export const filtersSelector = (state) => state.clientsViewState.filters;

export const errorMessageSelector = (state) => state.clientsViewState.errorMessage;
