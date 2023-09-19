import Map from '../../../../lib/Map.js';
import View from '../../../../lib/View.js';
import Image from '../../../../lib/layer/Image.js';
import ImageStatic from '../../../../lib/source/ImageStatic.js';
import Projection from "ol/proj/Projection";
import { getCenter } from 'ol/extent.js';

const extent = [0, 0, 1024, 968];
const projection = new Projection({
  code: "xkcd-image",
  units: "pixels",
  extent,
});

function StaticImage() {
  return (
    <Map>
      <View options={{ projection, center: getCenter(extent), zoom: 2, maxZoom: 8 }} />
      <Image>
        <ImageStatic
          options={{
            attributions: '© <a href="http://xkcd.com/license.html">xkcd</a>',
            url: "https://imgs.xkcd.com/comics/online_communities.png",
            projection,
            imageExtent: extent,
          }}
        />
      </Image>
    </Map>
  );
}

export default StaticImage;
