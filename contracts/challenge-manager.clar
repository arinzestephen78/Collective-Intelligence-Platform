;; Challenge Manager Contract

(define-data-var challenge-count uint u0)

(define-map challenges uint
  {
    creator: principal,
    title: (string-utf8 100),
    description: (string-utf8 1000),
    reward: uint,
    status: (string-ascii 20)
  }
)

(define-public (create-challenge (title (string-utf8 100)) (description (string-utf8 1000)) (reward uint))
  (let
    (
      (challenge-id (+ (var-get challenge-count) u1))
    )
    (map-set challenges challenge-id
      {
        creator: tx-sender,
        title: title,
        description: description,
        reward: reward,
        status: "open"
      }
    )
    (var-set challenge-count challenge-id)
    (ok challenge-id)
  )
)

(define-public (close-challenge (challenge-id uint))
  (let
    (
      (challenge (unwrap! (map-get? challenges challenge-id) (err u404)))
    )
    (asserts! (is-eq (get creator challenge) tx-sender) (err u403))
    (asserts! (is-eq (get status challenge) "open") (err u400))
    (map-set challenges challenge-id
      (merge challenge { status: "closed" })
    )
    (ok true)
  )
)

(define-read-only (get-challenge (challenge-id uint))
  (ok (unwrap! (map-get? challenges challenge-id) (err u404)))
)

(define-read-only (get-challenge-count)
  (ok (var-get challenge-count))
)

