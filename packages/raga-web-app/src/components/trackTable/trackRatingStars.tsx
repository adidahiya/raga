import { Rating } from "@mantine/core";

import { useOperationCallback } from "../../hooks";
import { appStore } from "../../store/appStore";

export interface TrackRatingStarsProps {
  trackID: number;
  /** 0-100 */
  rating: number | undefined;
}

export default function TrackRatingStars({ trackID, rating = 0 }: TrackRatingStarsProps) {
  const setTrackRating = appStore.use.setTrackRating();
  const handleRatingChange = useOperationCallback(
    function* (rating: number) {
      yield* setTrackRating(trackID, rating * 20);
    },
    [setTrackRating, trackID],
  );

  return <Rating value={rating / 20} size={16} count={5} onChange={handleRatingChange} />;
}
