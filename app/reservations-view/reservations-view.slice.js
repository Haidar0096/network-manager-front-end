"use strict";

import { isNumber } from "/app/common/object-utils/object-utils.js";

export const STATUS_IDLE = "Idle";
export const STATUS_LOADING = "Loading";

const reservationsAdapter = RTK.createEntityAdapter();

const initialState = reservationsAdapter.getInitialState({
  paginationData: {
    page: 1, // current page
    countPerPage: 5, // nb of reservations per page
    totalCount: 0, // total number of reservations, including the ones on the server
  },
  clients: [], // list of all available clients
  phoneNumbers: [], // list of all available phone numbers
  filters: {
    clientName: null, // filter by clientId
  },
  status: STATUS_IDLE,
  errorMessage: null,
});

/**
 * Calculates the offset of the given page, and given the countPerPage.
 */
const calculatePageOffset = (page, countPerPage) => (page - 1) * countPerPage;

/**
 * Calculates the total pages count, given the totalCount of the reservations and the countPerPage.
 */
const calculatePagesCount = (totalCount, countPerPage) => Math.ceil(totalCount / countPerPage);

/**
 * Calculates the total count of the reservations using the right api call depending on the filters.
 */
const getTotalCount = async (phoneNumbersApi, filters) => {
  if (filters.clientName) {
    return await phoneNumbersApi.getReservationsCountForClientName(filters.clientName);
  } else {
    return await phoneNumbersApi.getReservationsCount();
  }
};

const goToPage = RTK.createAsyncThunk("reservations/goToPage", async (args, utils) => {
  try {
    if (!isNumber(args.page)) {
      throw new Error("page must be a number");
    }
    const filters = filtersSelector(utils.getState());

    const currentPaginationData = paginationDataSelector(utils.getState());
    const countPerPage = currentPaginationData.countPerPage;

    const totalCount = await getTotalCount(args.phoneNumbersApi, filters);

    const pagesCount = calculatePagesCount(totalCount, countPerPage);

    let page = args.page;
    if (page < 1) {
      page = 1;
    } else if (page > pagesCount && pagesCount > 0) {
      page = pagesCount;
    }
    const offset = calculatePageOffset(page, countPerPage);

    // check if there is a filter on the phone number
    let reservations = [];
    if (filters.clientName) {
      reservations = await args.phoneNumbersApi.getReservationsByClientNamePaginated(
        filters.clientName,
        offset,
        countPerPage,
        false
      );
    } else {
      reservations = await args.phoneNumbersApi.getReservationsPaginated(offset, countPerPage);
    }

    await Promise.all(
      reservations.map(async (reservation) => {
        const clientName = (await args.clientsApi.getClientById(reservation.clientId)).Name;
        reservation.clientName = clientName;
        const phoneNumber = await args.phoneNumbersApi.getPhoneNumberById(reservation.phoneNumberId);
        reservation.phoneNumber = phoneNumber.Number;
        reservation.BED = moment(reservation.BED).toString();
        if (reservation.EED) {
          reservation.EED = moment(reservation.EED).toString();
        } else {
          reservation.EED = "N/A";
        }
        return reservation;
      })
    );

    const updatedPaginationData = { ...currentPaginationData, page: page, totalCount: totalCount };

    return utils.fulfillWithValue({ reservations: reservations, updatedPaginationData });
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const addReservation = RTK.createAsyncThunk("reservations/addReservations", async (args, utils) => {
  try {
    await args.phoneNumbersApi.addReservation(args.phoneNumberId, args.clientId, args.BED, args.EED);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const getClients = RTK.createAsyncThunk("reservations/getClients", async (args, utils) => {
  try {
    const clients = await args.clientsApi.getAllClients();
    return utils.fulfillWithValue(clients);
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const getPhoneNumbers = RTK.createAsyncThunk("reservations/getPhoneNumbers", async (args, utils) => {
  try {
    const phones = await args.phoneNumbersApi.getAllPhoneNumbers();
    return utils.fulfillWithValue(phones);
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const reservationsSlice = RTK.createSlice({
  name: "reservations",
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
        // update reservations
        reservationsAdapter.setAll(state, action.payload.reservations);
        // update paginated data
        state.paginationData = action.payload.updatedPaginationData;

        state.status = STATUS_IDLE;
      })
      .addCase(goToPage.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle addReservation
    builder
      .addCase(addReservation.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(addReservation.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(addReservation.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle getClients
    builder
      .addCase(getClients.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(getClients.fulfilled, (state, action) => {
        state.clients = action.payload;
        state.status = STATUS_IDLE;
      })
      .addCase(getClients.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle getPhoneNumbers
    builder
      .addCase(getPhoneNumbers.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(getPhoneNumbers.fulfilled, (state, action) => {
        state.phoneNumbers = action.payload;
        state.status = STATUS_IDLE;
      })
      .addCase(getPhoneNumbers.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });
  },
});

// Action Creators
export const reservationsActions = {
  ...reservationsSlice.actions,
  goToPage,
  addReservation,
  getClients,
  getPhoneNumbers,
};

// Reducer
export default reservationsSlice.reducer;

// Selectors
export const reservationsListSelector = (state) => Object.values(state.reservationsViewState.entities);

export const paginationDataSelector = (state) => state.reservationsViewState.paginationData;

export const pagesCountSelector = (state) =>
  calculatePagesCount(paginationDataSelector(state).totalCount, paginationDataSelector(state).countPerPage);

export const statusSelector = (state) => state.reservationsViewState.status;

export const filtersSelector = (state) => state.reservationsViewState.filters;

export const clientsSelector = (state) => state.reservationsViewState.clients;

export const phoneNumbersSelector = (state) => state.reservationsViewState.phoneNumbers;

export const errorMessageSelector = (state) => state.reservationsViewState.errorMessage;
