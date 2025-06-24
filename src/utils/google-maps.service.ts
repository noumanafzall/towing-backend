import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class GoogleMapsService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY');
    if (!this.apiKey) {
      throw new Error('Google Places API key is not configured');
    }
  }

  async getDirections(origin: string, destination: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/directions/json`, {
        params: {
          origin,
          destination,
          key: this.apiKey,
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch directions from Google Maps API');
    }
  }

  // Get Places details or autocomplete
  async getPlaces(query: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/autocomplete/json`, {
        params: {
          input: query,
          key: this.apiKey,
          types: 'address'
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch places from Google Places API');
    }
  }

  // Get place details by place_id
  async getPlaceDetails(placeId: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          key: this.apiKey,
          fields: 'formatted_address,geometry,name'
        },
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch place details from Google Places API');
    }
  }

  // Get client-side API key with restrictions
  getClientKey() {
    return {
      key: this.apiKey,
      timestamp: Date.now(),
      restrictions: {
        allowedOperations: ['directions', 'places', 'geocoding'],
      },
    };
  }
} 