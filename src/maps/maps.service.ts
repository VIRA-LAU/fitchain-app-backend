import { Injectable } from '@nestjs/common';
import {
  Client,
  LatLng,
} from '@googlemaps/google-maps-services-js';
import { ConfigService } from '@nestjs/config';

const client = new Client({});

@Injectable()
export class MapsService {
  constructor(private config: ConfigService) {}

  async getLocationName(
    latitude: number,
    longitude: number,
  ) {
    if (latitude && longitude) {
      return await client
        .reverseGeocode({
          params: {
            latlng: {
              lat: latitude,
              lng: longitude,
            },
            key: this.config.get(
              'GOOGLE_MAPS_API_KEY',
            ),
          },
        })
        .then((res) => {
          const results = res.data.results;
          if (results.length > 0) {
            const locationNameArr =
              results[0].formatted_address.split(
                ' ',
              );
            if (locationNameArr[0].includes('+'))
              locationNameArr.shift();
            const locationName =
              locationNameArr.join(' ');
            if (!locationName) return 'Unknown';
            return locationName;
          } else {
            return 'Unknown';
          }
        })
        .catch((error) => {
          console.error(
            error.response.data.error_message,
          );
          return 'Unknown';
        });
    }
  }

  async getDistanceFromLocation(
    latitude: number,
    longitude: number,
    locations: LatLng[],
  ) {
    return await client
      .distancematrix({
        params: {
          key: this.config.get(
            'GOOGLE_MAPS_API_KEY',
          ),
          origins: [
            {
              lat: latitude,
              lng: longitude,
            },
          ],
          destinations: locations,
        },
      })
      .then((res) => {
        const rows = res.data.rows;
        const distances = rows[0].elements.map(
          (element: any) =>
            element.distance.value,
        );
        return distances;
      })
      .catch((e) => {
        throw new Error(
          'Failed to fetch distances from Google Maps API',
        );
      });
  }
}
