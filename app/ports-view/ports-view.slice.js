"use strict";

import { isNumber } from "/app/common/object-utils/object-utils.js";

export const STATUS_IDLE = "Idle";
export const STATUS_LOADING = "Loading";

const portsAdapter = RTK.createEntityAdapter();

const initialState = portsAdapter.getInitialState({
  paginationData: {
    page: 1, // current page
    countPerPage: 5, // nb of ports per page
    totalCount: 0, // total number of ports, including the ones on the server
  },
  deviceIds: [], // list of all available devices ids
  filters: {
    portNumber: null, // filter by port number
  },
  status: STATUS_IDLE,
  errorMessage: null,
});

/**
 * Calculates the offset of the given page, and given the countPerPage.
 */
const calculatePageOffset = (page, countPerPage) => (page - 1) * countPerPage;

/**
 * Calculates the total pages count, given the totalCount of the ports and the countPerPage.
 */
const calculatePagesCount = (totalCount, countPerPage) => Math.ceil(totalCount / countPerPage);

/**
 * Calculates the total count of the ports using the right api call depending on the filters.
 */
const getTotalCount = async (portsApi, filters) => {
  if (filters.portNumber) {
    return await portsApi.getPortsCountForPortNumber(filters.portNumber);
  } else {
    return await portsApi.getPortsCount();
  }
};

/**
 * Navigates the state to the given page, and updates pagination data.
 * @param {page} page - the page to navigate to. If less than 1, navigates to the first page. If greater than pagesCount, navigates to the last page.
 * @param {portsApi} portsApi - the ports API
 */
const goToPage = RTK.createAsyncThunk("ports/goToPage", async (args, utils) => {
  try {
    // // TODO: remove returning dummy data
    // return utils.fulfillWithValue({
    //   ports: [
    //     new Port({ id: 1, number: 102, deviceId: 95 }),
    //     new Port({ id: 2, number: 2355, deviceId: 42 }),
    //     new Port({ id: 3, number: 4200, deviceId: 23 }),
    //     new Port({ id: 4, number: 4292, deviceId: 12 }),
    //   ],
    //   updatedPaginationData: paginationDataSelector(utils.getState()),
    // });
    if (!isNumber(args.page)) {
      throw new Error("page must be a number");
    }
    const filters = filtersSelector(utils.getState());

    const currentPaginationData = paginationDataSelector(utils.getState());
    const countPerPage = currentPaginationData.countPerPage;

    const totalCount = await getTotalCount(args.portsApi, filters);

    const pagesCount = calculatePagesCount(totalCount, countPerPage);

    let page = args.page;
    if (page < 1) {
      page = 1;
    } else if (page > pagesCount && pagesCount > 0) {
      page = pagesCount;
    }
    const offset = calculatePageOffset(page, countPerPage);

    // check if there is a filter on the port number
    let ports = [];
    if (filters.portNumber) {
      ports = await args.portsApi.getPortsByPortNumberPaginated(filters.portNumber, offset, countPerPage, false);
    } else {
      ports = await args.portsApi.getPortsPaginated(offset, countPerPage);
    }

    const updatedPaginationData = { ...currentPaginationData, page: page, totalCount: totalCount };

    return utils.fulfillWithValue({ ports, updatedPaginationData });
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Adds a port with the given number and associated device.
 * @param {portNumber} portNumber - the number of the port to add
 * @param {deviceName} deviceName - the name of the device associated to the port
 * @param {portsApi} portsApi - the ports API
 */
const addPort = RTK.createAsyncThunk("ports/addPort", async (args, utils) => {
  try {
    await args.portsApi.addPort(args.portNumber, args.deviceId);
    return utils.fulfillWithValue();
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

/**
 * Fetches All the available devices ids.
 * @param {devicesApi} portsApi - the ports API
 */
const getDeviceIds = RTK.createAsyncThunk("ports/getDevicesIds", async (args, utils) => {
  try {
    const ids = await args.devicesApi.getDeviceIds();
    return utils.fulfillWithValue(ids);
  } catch (e) {
    return utils.rejectWithValue(e);
  }
});

const portsSlice = RTK.createSlice({
  name: "ports",
  initialState,
  reducers: {
    changePortNumberFilter(state, action) {
      state.filters.portNumber = action.payload.portNumber;
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
        // update ports
        portsAdapter.setAll(state, action.payload.ports);
        // update paginated data
        state.paginationData = action.payload.updatedPaginationData;

        state.status = STATUS_IDLE;
      })
      .addCase(goToPage.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle addPort
    builder
      .addCase(addPort.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(addPort.fulfilled, (state, action) => {
        state.status = STATUS_IDLE;
      })
      .addCase(addPort.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });

    // handle getDeviceIds
    builder
      .addCase(getDeviceIds.pending, (state, action) => {
        state.status = STATUS_LOADING;
      })
      .addCase(getDeviceIds.fulfilled, (state, action) => {
        state.deviceIds = action.payload;
        state.status = STATUS_IDLE;
      })
      .addCase(getDeviceIds.rejected, (state, action) => {
        state.errorMessage = defaultErrorMessage;
        state.status = STATUS_IDLE;
      });
  },
});

// Action Creators
export const portsActions = {
  ...portsSlice.actions,
  goToPage,
  addPort,
  getDeviceIds,
};

// Reducer
export default portsSlice.reducer;

// Selectors
export const portsListSelector = (state) => Object.values(state.portsViewState.entities);

export const paginationDataSelector = (state) => state.portsViewState.paginationData;

export const pagesCountSelector = (state) =>
  calculatePagesCount(paginationDataSelector(state).totalCount, paginationDataSelector(state).countPerPage);

export const statusSelector = (state) => state.portsViewState.status;

export const filtersSelector = (state) => state.portsViewState.filters;

export const deviceIdsSelector = (state) => state.portsViewState.deviceIds;

export const errorMessageSelector = (state) => state.portsViewState.errorMessage;
