;; Solution Submission Contract

(define-data-var submission-count uint u0)

(define-map submissions uint
  {
    challenge-id: uint,
    submitter: principal,
    content: (string-utf8 2000),
    status: (string-ascii 20)
  }
)

(define-public (submit-solution (challenge-id uint) (content (string-utf8 2000)))
  (let
    (
      (submission-id (+ (var-get submission-count) u1))
    )
    (map-set submissions submission-id
      {
        challenge-id: challenge-id,
        submitter: tx-sender,
        content: content,
        status: "pending"
      }
    )
    (var-set submission-count submission-id)
    (ok submission-id)
  )
)

(define-public (evaluate-solution (submission-id uint) (new-status (string-ascii 20)))
  (let
    (
      (submission (unwrap! (map-get? submissions submission-id) (err u404)))
      (challenge (unwrap! (contract-call? .challenge-manager get-challenge (get challenge-id submission)) (err u404)))
    )
    (asserts! (is-eq (get creator challenge) tx-sender) (err u403))
    (asserts! (is-eq (get status submission) "pending") (err u400))
    (map-set submissions submission-id
      (merge submission { status: new-status })
    )
    (ok true)
  )
)

(define-read-only (get-submission (submission-id uint))
  (ok (unwrap! (map-get? submissions submission-id) (err u404)))
)

(define-read-only (get-submission-count)
  (ok (var-get submission-count))
)

