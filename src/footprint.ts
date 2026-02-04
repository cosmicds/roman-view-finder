import { Color, RenderContext, SimpleLineList, Vector3d, WWTControl } from "@wwtelescope/engine";

type Point = [number, number];

const corners: Point[][] =
[[[100.48009092874995, -12.307469340290911],
  [100.41577899383678, -12.41545009604512],
  [100.30649777338384, -12.354607615836963],
  [100.37108768453875, -12.24602406644596]],
[[100.60846831935348, -12.380258091782805],
  [100.54461845559527, -12.487335758825681],
  [100.43752504414195, -12.428045599442184],
  [100.50176207252403, -12.320207807096175]],
[[100.72309246340939, -12.445209378388816],
  [100.65975811704935, -12.551297579398028],
  [100.55513096447993, -12.493675214282025],
  [100.61894725776557, -12.386685368607491]],
[[100.38714196098503, -12.41149156940854],
  [100.3223641158659, -12.518651277142737],
  [100.21264604880975, -12.45825823829397],
  [100.27751239736061, -12.350447797797312]],
[[100.51596324385741, -12.484577039662774],
  [100.4514277625751, -12.590768739982185],
  [100.3436616957176, -12.532056969251801],
  [100.4084071407627, -12.425056752748906]],
[[100.63052051425923, -12.549364352591295],
  [100.56632268395735, -12.65452482375087],
  [100.46081852148238, -12.597572655262208],
  [100.52533603815864, -12.491478763238714]],
[[100.25996905599143, -12.496232779488539],
  [100.19516391879596, -12.602295181723548],
  [100.0849199936642, -12.541968859851918],
  [100.14959751922116, -12.43526073760415]],
[[100.38967476883532, -12.569907637977131],
  [100.32484589528846, -12.67498875928342],
  [100.21616161728649, -12.616387471357228],
  [100.28098659079158, -12.510501427140744]],
[[100.50295957131152, -12.635232658903089],
  [100.43824171925002, -12.739279265905367],
  [100.33145404011867, -12.682463545329867],
  [100.39627763046792, -12.577492458953353]],
[[100.54894882697462, -12.190044308676342],
  [100.48540402083562, -12.298456229568512],
  [100.37643329968596, -12.236966686937427],
  [100.44041900863186, -12.1280478091237]],
[[100.67711961547217, -12.26291855701836],
  [100.61421687201474, -12.370529959960164],
  [100.50755464751829, -12.31040968102928],
  [100.57099373190628, -12.202119497504262]],
[[100.79147233897736, -12.328065434540681],
  [100.72924693056646, -12.43477808407598],
  [100.62515145056433, -12.376169306747606],
  [100.68799589144234, -12.268628071242773]],
[[100.59372353419704, -12.05941224938208],
  [100.53113011053524, -12.167810242132234],
  [100.42227278450854, -12.105604475269416],
  [100.48545031906734, -11.996834814062307]],
[[100.7221144380107, -12.132357976436582],
  [100.66032764063566, -12.24009791951935],
  [100.5537887237505, -12.17901569883405],
  [100.61624621807518, -12.070717004385944]],
[[100.83609003177551, -12.197377932385573],
  [100.7751059369642, -12.304351236933451],
  [100.67113907866269, -12.244549646646554],
  [100.73284361743255, -12.13686766130106]],
[[100.60435579692155, -11.91001319208415],
  [100.54272062111389, -12.017876814632574],
  [100.43364869778635, -11.954970954709873],
  [100.49598166470804, -11.846927436209915]],
[[100.73345378633982, -11.983229070249742],
  [100.67276082764408, -12.090645863424042],
  [100.56584829716482, -12.028516974875645],
  [100.6273092901541, -11.920733177360963]],
[[100.84706188664376, -12.046729053086862],
  [100.78729035592167, -12.153572386024104],
  [100.68278694359215, -12.09241295263707],
  [100.74337343576839, -11.985051999114892]]];

// const nRegions = corners.length;
const nPoints = corners.reduce((currVal, corner) => currVal + corner.length, 0);

const fakeControl = new WWTControl();
fakeControl.renderContext = new RenderContext();

const meanIndex = (index: number) => corners.reduce((currVal, corner) => currVal + corner.reduce((curr, pair) => curr + pair[index], 0), 0) / nPoints;
const meanRA = meanIndex(0);
const meanDec = meanIndex(1);
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
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    fakeControl.canvas = shadow; fakeControl.renderContext.gl = shadow.getContext("webgl2"); fakeControl.renderContext.set_backgroundImageset(wwt.renderContext.get_backgroundImageset());
    fakeControl.renderOneFrame();
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
