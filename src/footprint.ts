/* eslint-disable */

import { Color, RenderContext, SimpleLineList, Vector3d, WWTControl } from "@wwtelescope/engine";

type Point = [number, number];

const corners: Point[][] =
[[[0.019629195791240506, -0.017470072851674855],
  [359.9568130279977, -0.1254536435458396],
  [359.8500524760996, -0.06465037162139137],
  [359.9131107866697, 0.04396158299422878]],
 [[0.145016040843638, -0.09029808540616766],
  [0.08261719514719405, -0.19734874486179577],
  [359.9780516349578, -0.1380465157516101],
  [0.04080031334526184, -0.030210972190530413]],
 [[0.25691136018644584, -0.15533493285303723],
  [0.19498627475035218, -0.261369931177155],
  [0.09287883805212387, -0.20369162697024426],
  [0.1552475199136799, -0.09673120586171019]],
 [[359.92884455325674, -0.1215011994179428],
  [359.8656352761967, -0.22868562960631142],
  [359.7584693777426, -0.16836921493510332],
  [359.8217355079638, -0.06050822590782947]],
 [[0.05464026474009367, -0.19458271977322225],
  [359.99163379336653, -0.3007688732004927],
  [359.8864324741456, -0.24208151170068032],
  [359.9496153947864, -0.13506158143048175]],
 [[0.16644833158576727, -0.2594170752042104],
  [0.10374206754788672, -0.364545312802362],
  [0.0007988279083892058, -0.3075726564767831],
  [0.06378980939767157, -0.20148650509659838]],
 [[359.8047064944183, -0.20630534424160502],
  [359.7415405450667, -0.3124223298635881],
  [359.63386702687916, -0.25222395516815455],
  [359.6968786716973, -0.14543551362614296]],
 [[359.93135956201036, -0.27991660467015267],
  [359.86813657265014, -0.38502186435669805],
  [359.76204542931043, -0.3264952509806584],
  [359.82523574623116, -0.22055954090217864]],
 [[0.041919955920319774, -0.34523600410144295],
  [359.97877667736293, -0.4492801236916265],
  [359.8745873943946, -0.3924934914521667],
  [359.9378060333114, -0.28749982070682506]],
 [[0.08694339283577343, 0.0999413259189208],
  [0.024821032170444433, -0.00845740085579414],
  [359.9183319560919, 0.05302063577113153],
  [359.9808559699963, 0.1619514945558087]],
 [[0.21216565031256088, 0.026995874308417295],
  [0.15063649751621042, -0.08057311216570652],
  [0.04646121928400127, -0.020413785193067097],
  [0.10848629449180579, 0.08785813515557367]],
 [[0.32382894386515154, -0.03826482436544433],
  [0.2629316663830847, -0.14490958659292988],
  [0.1613137521903426, -0.08621879414896355],
  [0.2227889263569192, 0.02127757455714294]],
 [[0.13077350769129467, 0.23055526668714757],
  [0.06953229191513788, 0.12218057071126676],
  [359.96311154395073, 0.18439293957697303],
  [0.02489478665054768, 0.2931640090289984]],
 [[0.25626096184056585, 0.15751725250958232],
  [0.1957738009874361, 0.04982922936897075],
  [0.09167801220846783, 0.11096832925563443],
  [0.15279276227404023, 0.21923864974315885]],
 [[0.3676003713515863, 0.09236526024495748],
  [0.30786770185820633, -0.014531439452250636],
  [0.20633597978539112, 0.045369428061198584],
  [0.26674596503293946, 0.15299714637063133]],
 [[0.14125133943662796, 0.3799489315998713],
  [0.08090851825072831, 0.27211075313552635],
  [359.9742197984615, 0.3350277833768177],
  [0.03521629265194743, 0.44307021000931385]],
 [[0.26749858229270274, 0.3066350527933118],
  [0.20804248641227893, 0.19927191526646706],
  [0.10352536719752702, 0.261462670097505],
  [0.1637045378207422, 0.36921594562316173]],
 [[0.37854117570109735, 0.2429987813527034],
  [0.31995556328422725, 0.13623309456904079],
  [0.21784479099287624, 0.19749689490871694],
  [0.27720028146022846, 0.30480208817177973]]];
 

// const nRegions = corners.length;
const nPoints = corners.reduce((currVal, corner) => currVal + corner.length, 0);

const fakeControl = new WWTControl();
fakeControl.renderContext = new RenderContext();

const meanIndex = (index: number) => corners.reduce((currVal, corner) => currVal + corner.reduce((curr, pair) => curr + pair[index], 0), 0) / nPoints;
// const meanRA = meanIndex(0);
// const meanDec = meanIndex(1);
const meanRA = 0;
const meanDec = 0;
const shiftedCorners: Point[][] = corners.map(corner => corner.map(pair => [pair[0] - meanRA, pair[1] - meanDec]));

function getScreenPoints(wwt: WWTControl, worldPts: Point[]): Point[] {
  return worldPts.map(pt => {
    const screen = wwt.getScreenPointForCoordinates(pt[0] / 15, pt[1]);
    return [screen.x, screen.y];
  });
}

function _getWorldPoints(wwt: WWTControl, screenPts: Point[]): Point[] {
  return screenPts.map(pt => {
    const raDec = wwt.getCoordinatesForScreenPoint(...pt);
    return [15 * (raDec.x + 720) / 360, raDec.y];
  });
}

// NB: Clip space is the space [-1, 1]^2
function convertScreenPointsToClip(wwt: WWTControl, screenPts: Point[][]): Point[][] {
  const width = wwt.renderContext.width;
  const height = wwt.renderContext.height;
  const slopeH = 2 / width;
  const interceptH = -1;
  const slopeV = 2 / height;
  const interceptV = -1;
  const transform = (point: Point): Point => [point[0] * slopeH + interceptH, point[1] * slopeV + interceptV];
  return screenPts.map(box => box.map(transform));
}

let fakeRendered = false;
export function drawFootprint(wwt: WWTControl, color: Color) {
  if (!fakeRendered) {
    const shadow = document.getElementById("shadow") as HTMLCanvasElement;
    console.log(wwt.renderContext.get_RA(), wwt.renderContext.get_dec());
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fakeControl.canvas = shadow; fakeControl.renderContext.gl = shadow.getContext("webgl2"); fakeControl.renderContext.set_backgroundImageset(wwt.renderContext.get_backgroundImageset());
    fakeControl.renderOneFrame();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fakeControl.renderContext.set_world(wwt.renderContext.get_world()); fakeControl.renderContext.set_view(wwt.renderContext.get_view());
    fakeRendered = true;
  }
  const footprint = new SimpleLineList();
  footprint.pure2D = true;
  footprint.set_depthBuffered(true);

  const camera = wwt.renderContext.viewCamera;
  fakeControl.renderContext.viewCamera.zoom = camera.zoom;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  fakeControl.renderContext.set_projection(wwt.renderContext.get_projection());
  const screenPoints = shiftedCorners.map(box => getScreenPoints(fakeControl, box));
  const clipPoints = convertScreenPointsToClip(fakeControl, screenPoints);

  clipPoints.forEach(box => {
    for (let i = 0; i < box.length - 1; i++) {
      footprint.addLine(Vector3d.create(box[i][0], box[i][1], 0), Vector3d.create(box[i+1][0], box[i+1][1], 0));
    }
    footprint.addLine(Vector3d.create(box[box.length-1][0], box[box.length-1][1], 0), Vector3d.create(box[0][0], box[0][1], 0));
  });

  footprint.drawLines(wwt.renderContext, 1, color);
}
