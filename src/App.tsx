import React from 'react';
import { compose, withProps } from "recompose"
import { withScriptjs, withGoogleMap, GoogleMap, Marker, Polygon } from "react-google-maps"
import './App.css';

interface IAppState
{
  readonly status: 'Loading' | 'Errored' | 'Loaded';
  readonly details: ConfigDetails;
  readonly distance: Distance;
  readonly distanceInKm: string;
  readonly isOrigin: boolean;
  readonly error?: string;
}

interface ConfigDetails
{
  readonly embededMapKey: string;
}

interface DistanceInKm
{
  readonly distance: string;
}

interface Distance
{
  readonly origin: Point;
  readonly destination: Point;
}

interface Point
{
  lat: number;
  lon: number;
}

class App extends React.Component<{},IAppState> {

  constructor(props: Readonly<{}>) {
    super(props);
    this.state = {
      status: 'Loading',
      details: {
        embededMapKey: ''
      },
      distance:{
        origin:{
          lat: 29.3595331,
          lon: 47.9646146
        },
        destination:{
          lat: 29.3778591,
          lon: 47.985214 
        }
      },
      distanceInKm: '',
      isOrigin: true
    };
    this.loadDetails();
    this.loadDistance();
  }
  
  private readonly loadDistance = async (): Promise<void> => {
    try {
      const response = await fetch('/points', {
        method: 'POST',
        headers: [['content-type', 'application/json']],
        body: JSON.stringify(this.state.distance),
      });
      if (response.ok) {
        const details = (await response.json()) as DistanceInKm;
        this.setState((state) => ({
          ...state,
          status: 'Loaded',
          distanceInKm: details.distance,
        }));
      } else {
        this.setState((state) => ({
          ...state,
          status: 'Errored',
          error: `${response.status}: ${response.statusText}`,
        }));
      }
    } catch (error) {
      this.setState((state) => ({
        ...state,
        status: 'Errored',
        error: error.message,
      }));
    }
  };

  private readonly loadDetails = async (): Promise<void> => {
    try {
      const response = await fetch('/config', {
        method: 'GET',
      });
      if (response.ok) {
        const details = (await response.json()) as ConfigDetails;
        this.setState((state) => ({
          ...state,
          status: 'Loaded',
          details,
        }));
      } else {
        this.setState((state) => ({
          ...state,
          status: 'Errored',
          error: `${response.status}: ${response.statusText}`,
        }));
      }
    } catch (error) {
      this.setState((state) => ({
        ...state,
        status: 'Errored',
        error: error.message,
      }));
    }
  };

  handleClick = (event: any) => {
    var lat = event.latLng.lat(), lng = event.latLng.lng();
    if(this.state.isOrigin){
    this.setState((state) => ({
      ...state,
      status:'Loading',
      distance: 
      {
        ...state.distance,
        origin:{
          lat, lon:lng
        }
      },
    }), () => this.loadDistance());
  }else{
    this.setState((state) => ({
      ...state,
      status:'Loading',
      distance: 
      {
        ...state.distance,
        destination:{
          lat, lon:lng
        }
      },
    }), () => this.loadDistance());
  }
  this.setState((state) => ({
    ...state,
    isOrigin: !state.isOrigin
  }));
  }

  render(): JSX.Element {
    const { status, error, distance, distanceInKm } = this.state;

    const MyMapComponent = compose(
      withProps({
        googleMapURL: `https://maps.googleapis.com/maps/api/?js&v=3.exp&libraries=geometry,drawing,places`,
        loadingElement: <div style={{ height: `100%` }} />,
        containerElement: <div style={{ height: `400px` }} />,
        mapElement: <div style={{ height: `150%` }} />,
      }),
      withScriptjs,
      withGoogleMap
    )(((props: any) =>
      <GoogleMap
        defaultZoom={13}
        defaultCenter={{ lat: 29.3760641, lng: 47.9643571 }}
        onClick={(e) => this.handleClick(e)}
      >
        <Marker position={{ lat: distance.origin.lat, lng: distance.origin.lon }}/>
        <Marker position={{ lat: distance.destination.lat, lng: distance.destination.lon }} />
        <Polygon
        path={[
          {lat: distance.origin.lat,lng: distance.origin.lon},
          {lat: distance.destination.lat,lng: distance.destination.lon }]}
        key={1}
        options={{
            fillColor: "#000",
            fillOpacity: 0.4,
            strokeColor: "#000",
            strokeOpacity: 1,
            strokeWeight: 1
        }}
        onClick={() => {
            console.log("ahmet")
        }}/>
      </GoogleMap>
    ));

    switch (status) {
      case 'Errored':
        return (
          <div>
            <h3>Error!</h3>
            <pre>{error}</pre>
          </div>
        );
      case 'Loaded':
        return (
          
          <>
          <div>
    <h3>Select two points {distanceInKm}</h3>
          </div>
          <div style={{width: '100%',height: '90%', position: 'fixed'}} >
          <MyMapComponent />
        </div>
        </>
        );
      default:
        return <>Loading...</>;
    }
  }
}

export default App;
