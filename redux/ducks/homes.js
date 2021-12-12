import { createSlice } from "@reduxjs/toolkit";
import { HYDRATE } from "next-redux-wrapper";
import { createSelector } from "reselect";

import { apiCallBegan } from "../actions";

const slice = createSlice({
  name: "homes",
  initialState: {
    properties: [],
    propertyDetails: {},
    propertiesForSale: [],
    propertiesForRent: [],
    loading: false,
  },
  reducers: {
    homesRequested: (homes) => {
      homes.loading = true;
    },

    homesReceived: (homes, action) => {
      if (action.payload.hasOwnProperty("properties")) {
        homes.properties = action.payload;
      } else {
        homes.propertiesForSale = action.payload.propertiesForSale;
        homes.propertiesForRent = action.payload.propertiesForRent;
      }
      homes.loading = false;
    },

    propertyDetailsReceived: (homes, action) => {
      homes.propertyDetails = action.payload;
      homes.loading = false;
    },

    homesRequestFailed: (homes) => {
      homes.loading = false;
    },
  },
  extraReducers: {
    [HYDRATE]: (homes, action) => {
      return {
        ...homes,
        ...action.payload.homes,
      };
    },
  },
});

export const {
  homesRequested,
  homesReceived,
  homesRequestFailed,
  propertyDetailsReceived,
} = slice.actions;
export default slice.reducer;

// Action creators
const forSaleUrl =
  "/properties/list?locationExternalIDs=5002&purpose=for-sale&hitsPerPage=6";
const forRentUrl =
  "/properties/list?locationExternalIDs=5002&purpose=for-rent&hitsPerPage=6";

export const loadHomes = () => (dispatch, getState) => {
  const { homes } = getState();

  if (homes.propertiesForSale.length || homes.propertiesForRent.length) {
    return;
  }

  dispatch(
    apiCallBegan({
      urls: [forSaleUrl, forRentUrl],
      onStart: homesRequested.type,
      onSuccess: homesReceived.type,
      onError: homesRequestFailed.type,
    })
  );
};

export const queryHomes = (query) => (dispatch) => {
  const purpose = query.purpose || "for-rent";
  const rentFrequency = query.rentFrequency || "yearly";
  const minPrice = query.minPrice || "0";
  const maxPrice = query.maxPrice || "1000000";
  const roomsMin = query.roomsMin || "0";
  const bathsMin = query.bathsMin || "0";
  const sort = query.sort || "price-desc";
  const areaMax = query.areaMax || "35000";
  const locationExternalIDs = query.locationExternalIDs || "5002";
  const categoryExternalID = query.categoryExternalID || "4";

  dispatch(
    apiCallBegan({
      url: `/properties/list?locationExternalIDs=${locationExternalIDs}&purpose=${purpose}&categoryExternalID=${categoryExternalID}&bathsMin=${bathsMin}&rentFrequency=${rentFrequency}&priceMin=${minPrice}&priceMax=${maxPrice}&roomsMin=${roomsMin}&sort=${sort}&areaMax=${areaMax}`,
      onStart: homesRequested.type,
      onSuccess: homesReceived.type,
      onError: homesRequestFailed.type,
    })
  );
};

export const queryPropertyDetails = (id) => (dispatch) => {
  dispatch(
    apiCallBegan({
      url: `/properties/detail?externalID=${id}`,
      onStart: homesRequested.type,
      onSuccess: propertyDetailsReceived.type,
      onError: homesRequestFailed.type,
    })
  );
};

// Selectors
export const getPropertiesForSaleRent = createSelector(
  (state) => state.homes.propertiesForSale,
  (state) => state.homes.propertiesForRent,
  (forSale, forRent) => ({
    propertiesForSale: forSale,
    propertiesForRent: forRent,
  })
);

export const getProperties = createSelector(
  (state) => state.homes.properties,
  (properties) => properties
);

export const getPropertyDetails = createSelector(
  (state) => state.homes.propertyDetails,
  (propertyDetails) => propertyDetails
);
